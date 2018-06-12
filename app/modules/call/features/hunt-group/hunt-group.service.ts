import { HuntGroup, HuntGroupNumber } from './hunt-group';
import { NumberType } from 'modules/huron/numbers';
import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';
import { MemberType, USER_PLACE } from 'modules/huron/members';
import { CallFeatureMember, CardType, ComplexCardType, MemberItem } from 'modules/call/features/shared/call-feature-members/call-feature-member';
import { FeatureMemberService } from 'modules/huron/features/services';

export interface IHuntGroupListItem {
  uuid: string;
  name: string;
  memberCount: number;
  numbers: HuntGroupNumber[];
}

interface IHuntGroupResource extends ng.resource.IResourceClass<ng.resource.IResource<HuntGroup>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

const NUMBER_FORMAT_EXTENSION: string = 'NUMBER_FORMAT_EXTENSION';
const NUMBER_FORMAT_DIRECT_LINE: string = 'NUMBER_FORMAT_DIRECT_LINE';
const NUMBER_FORMAT_ENTERPRISE_LINE: string = 'NUMBER_FORMAT_ENTERPRISE_LINE';

export class HuntGroupService {
  private huntGroupResource: IHuntGroupResource;
  private huntGroupCopy: HuntGroup;
  private huntGroupProperties: string[] = ['uuid', 'name', 'huntMethod', 'maxRingSecs', 'maxWaitMins', 'sendToApp', 'destinationRule', 'numbers', 'fallbackDestination', 'alternateDestination', 'members'];
  private locationPromise: ng.IPromise<boolean>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private $q: ng.IQService,
    private Authinfo,
    private HuronConfig,
    private FeatureMemberService: FeatureMemberService,
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
  ) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.locationPromise = this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484);

    this.huntGroupResource = <IHuntGroupResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/huntgroups/:huntGroupId', {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getHuntGroupList(): ng.IPromise<ng.resource.IResourceArray<ng.resource.IResource<HuntGroup>>> {
    const huntGroupListPromise = this.huntGroupResource.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;

    return this.$q.all({
      huntGroups: huntGroupListPromise,
      locations: this.locationPromise,
    }).then(promises => {
      _.forEach(promises.huntGroups, huntGroup => {
        _.set(huntGroup, 'numbers', _.filter(_.get(huntGroup, 'numbers'), (number) => {
          if (promises.locations) {
            return _.get(number, 'type') === NumberType.NUMBER_FORMAT_ENTERPRISE_LINE || _.get(number, 'type') === NumberType.NUMBER_FORMAT_DIRECT_LINE;
          } else {
            return _.get(number, 'type') === NumberType.NUMBER_FORMAT_EXTENSION || _.get(number, 'type') === NumberType.NUMBER_FORMAT_DIRECT_LINE;
          }
        }));
      });
      return promises.huntGroups;
    });
  }

  public getHuntGroup(huntGroupId: string): ng.IPromise<HuntGroup> {
    if (!huntGroupId) {
      return this.$q.resolve(new HuntGroup());
    } else {
      const huntGroupPromise = this.huntGroupResource.get({
        customerId: this.Authinfo.getOrgId(),
        huntGroupId: huntGroupId,
      }).$promise;

      return this.$q.all({
        huntGroups: huntGroupPromise,
        locations: this.locationPromise,
      }).then( (results) => {
        const huntGroupResource = results.huntGroups;
        const huntGroup = new HuntGroup(_.pick<HuntGroup, HuntGroup>(huntGroupResource, this.huntGroupProperties));
        // TODO (jlowery): remove when CMI normalizes fallbackDestination payloads across APIs
        huntGroup.fallbackDestination = new FallbackDestination({
          memberUuid: _.get<string>(huntGroupResource.fallbackDestination, 'uuid'),
          name: _.get<string>(huntGroupResource.fallbackDestination, 'memberName'),
          number: _.get<string>(huntGroupResource.fallbackDestination, 'number'),
          numberUuid: _.get<string>(huntGroupResource.fallbackDestination, 'numberUuid'),
          sendToVoicemail: _.get<boolean>(huntGroupResource.fallbackDestination, 'sendToVoicemail'),
        });
        huntGroup.fallbackDestination.name =  _.isNull(huntGroup.fallbackDestination.name) ? _.get<string>(huntGroupResource.fallbackDestination, 'userName') : huntGroup.fallbackDestination.name;

        huntGroup.alternateDestination = new FallbackDestination({
          memberUuid: _.get<string>(huntGroupResource.alternateDestination, 'uuid'),
          name: _.get<string>(huntGroupResource.alternateDestination, 'memberName'),
          number: _.get<string>(huntGroupResource.alternateDestination, 'number'),
          numberUuid: _.get<string>(huntGroupResource.alternateDestination, 'numberUuid'),
          sendToVoicemail: _.get<boolean>(huntGroupResource.alternateDestination, 'sendToVoicemail'),
          timer: _.get<number>(huntGroupResource.alternateDestination, 'timer'),
        });
        huntGroup.alternateDestination.name =  _.isNull(huntGroup.alternateDestination.name) ? _.get<string>(huntGroupResource.alternateDestination, 'userName') : huntGroup.alternateDestination.name;

        huntGroup.numbers = _.filter(huntGroupResource.numbers, (number) => {
          if (results.locations) {
            return number.type === NumberType.NUMBER_FORMAT_ENTERPRISE_LINE || number.type === NumberType.NUMBER_FORMAT_DIRECT_LINE;
          } else {
            return number.type === NumberType.NUMBER_FORMAT_EXTENSION || number.type === NumberType.NUMBER_FORMAT_DIRECT_LINE;
          }
        });

        const huntGroupMembers: CallFeatureMember[] = this.consolidateMembers(huntGroupResource.members);
        const promises: ng.IPromise<CallFeatureMember>[] = [];
        _.forEach(huntGroupMembers, member => {
          promises.push(this.FeatureMemberService.getMemberPicture(member.memberItemId || '')
            .then(response => {
              member.thumbnailSrc = _.get(response, 'thumbnailSrc', undefined);
              return member;
            })
            .catch( () => {
              return member;
            }));
        });

        return this.$q.all(promises).then( (huntGroupMembers) => {
          huntGroup.members = huntGroupMembers;
          return huntGroup;
        });

      }).then(huntGroup => {
        this.huntGroupCopy = this.cloneHuntGroupData(huntGroup);
        return huntGroup;
      });
    }
  }

  /**
   * Function to consolidate members based on unique numberUuid.
   * If members share a line then the CallFeatureMember will put all
   * users sharing that line in the memberItems array.
   *
   * @private
   * @param {Array<CallFeatureMember>} members
   * @returns {Array<CallFeatureMember>}
   *
   * @memberOf HuntGroupService
   */
  private consolidateMembers(members: CallFeatureMember[]): CallFeatureMember[] {
    const consolidatedMembers: CallFeatureMember[] = [];
    const groupedMembers = _.groupBy(members, 'numberUuid');
    _.forEach(groupedMembers, group => {
      if (group.length > 1) {
        const sharedLine = new CallFeatureMember({
          uuid: _.get<string>(group[0], 'numberUuid'),
          name: this.$translate.instant('huronHuntGroup.sharedLine'),
          showName: true,
          type: MemberType.USER_GROUP,
          cardType: CardType.COMPLEX,
          complexCardType: ComplexCardType.STATIC,
          number: _.get<string>(group[0], 'number'),
          memberItems: [],
          memberItemId: undefined,
          thumbnailSrc: undefined,
        });
        _.forEach(group, groupMember => {
          if (sharedLine.memberItems) {
            sharedLine.memberItems.push(new MemberItem({
              label: _.get<string>(groupMember, 'memberName'),
              sublabel: undefined,
              value: _.get<string>(group[0], 'userUuid'),
            }));
          }
        });
        consolidatedMembers.push(sharedLine);
      } else if (group.length === 1) {
        consolidatedMembers.push(new CallFeatureMember({
          uuid: _.get<string>(group[0], 'numberUuid'),
          name: _.get<string>(group[0], 'memberName'),
          showName: true,
          type: _.get<string>(group[0], 'memberType') === USER_PLACE ? MemberType.USER_PLACE : MemberType.USER_REAL_USER,
          cardType: CardType.SIMPLE,
          complexCardType: undefined,
          number: _.get<string>(group[0], 'number'),
          memberItems: undefined,
          memberItemId: _.get<string>(group[0], 'userUuid'),
          thumbnailSrc: undefined,
        }));
      }
    });
    return consolidatedMembers;
  }

  public getOriginalConfig(): HuntGroup {
    return this.cloneHuntGroupData(this.huntGroupCopy);
  }

  public matchesOriginalConfig(huntGroup: HuntGroup): boolean {
    return _.isEqual(huntGroup, this.huntGroupCopy);
  }

  public createHuntGroup(data: HuntGroup): ng.IPromise<string> {
    let location: string;
    return this.locationPromise.then(locations => {
      return this.huntGroupResource.save({
        customerId: this.Authinfo.getOrgId(),
      }, {
        name: data.name,
        huntMethod: data.huntMethod,
        fallbackDestination: {
          number: data.fallbackDestination.number,
          numberUuid: data.fallbackDestination.numberUuid,
          sendToVoicemail: data.fallbackDestination.sendToVoicemail,
        },
        numbers: _.map(data.numbers, (number) => {
          if (locations) {
            return {
              number: number.siteToSite ? number.siteToSite : number.number,
              type: number.type ? number.type : number.siteToSite ? NUMBER_FORMAT_ENTERPRISE_LINE : NUMBER_FORMAT_DIRECT_LINE,
            };
          } else {
            return {
              number: number.number,
              type: number.type === NumberType.INTERNAL ? NUMBER_FORMAT_EXTENSION : NUMBER_FORMAT_DIRECT_LINE,
            };
          }
        }),
        members: _.map(data.members, (member) => {
          return member.uuid;
        }),
      }, (_response, headers) => {
        location = headers('Location');
      }).$promise
        .then( () => location);
    });
  }

  public updateHuntGroup(huntGroupId: string, data: HuntGroup): ng.IPromise<HuntGroup> {
    return this.locationPromise.then(locations => {
      return this.huntGroupResource.update({
        customerId: this.Authinfo.getOrgId(),
        huntGroupId: huntGroupId,
      }, {
        name: data.name,
        huntMethod: data.huntMethod,
        maxRingSecs: data.maxRingSecs,
        maxWaitMins: data.maxWaitMins,
        sendToApp: data.sendToApp,
        destinationRule: data.destinationRule,
        fallbackDestination: {
          number: data.fallbackDestination.number,
          numberUuid: data.fallbackDestination.numberUuid,
          sendToVoicemail: data.fallbackDestination.sendToVoicemail,
        },
        alternateDestination: {
          number: data.alternateDestination.number,
          numberUuid: data.alternateDestination.numberUuid,
          sendToVoicemail: data.alternateDestination.sendToVoicemail,
          timer: data.alternateDestination.timer,
        },
        numbers: _.map(data.numbers, (number) => {
          if (locations) {
            return {
              number: number.siteToSite ? number.siteToSite : number.number,
              type: number.type ? number.type : number.siteToSite ? NUMBER_FORMAT_ENTERPRISE_LINE : NUMBER_FORMAT_DIRECT_LINE,
            };
          } else {
            return {
              number: number.number,
              type: number.type === NumberType.INTERNAL || number.type === NUMBER_FORMAT_EXTENSION ? NUMBER_FORMAT_EXTENSION : NUMBER_FORMAT_DIRECT_LINE,
            };
          }
        }),
        members: _.map(data.members, (member) => {
          // return member.memberUuid;
          return member.uuid;
        }),
      }).$promise
        .then( () => {
          return this.getHuntGroup(huntGroupId);
        });
    });
  }

  public deleteHuntGroup(huntGroupId: string): ng.IPromise<any> {
    return this.huntGroupResource.delete({
      customerId: this.Authinfo.getOrgId(),
      huntGroupId: huntGroupId,
    }).$promise;
  }

  private cloneHuntGroupData(huntGroupData: HuntGroup): HuntGroup {
    return _.cloneDeep(huntGroupData);
  }

}
