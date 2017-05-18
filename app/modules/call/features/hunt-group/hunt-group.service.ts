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
  numbers: Array<HuntGroupNumber>;
}

interface IHuntGroupResource extends ng.resource.IResourceClass<ng.resource.IResource<HuntGroup>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

const NUMBER_FORMAT_EXTENSION: string = 'NUMBER_FORMAT_EXTENSION';
const NUMBER_FORMAT_DIRECT_LINE: string = 'NUMBER_FORMAT_DIRECT_LINE';

export class HuntGroupService {
  private huntGroupResource: IHuntGroupResource;
  private huntGroupCopy: HuntGroup;
  private huntGroupProperties: Array<string> = ['uuid', 'name', 'huntMethod', 'maxRingSecs', 'maxWaitMins', 'numbers', 'members'];

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private $q: ng.IQService,
    private Authinfo,
    private HuronConfig,
    private FeatureMemberService: FeatureMemberService,
    private $translate: ng.translate.ITranslateService,
  ) {

    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    let saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.huntGroupResource = <IHuntGroupResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/huntgroups/:huntGroupId', {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getHuntGroupList(): ng.IPromise<ng.resource.IResourceArray<ng.resource.IResource<HuntGroup>>> {
    return this.huntGroupResource.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public getHuntGroup(huntGroupId: string): ng.IPromise<HuntGroup> {
    if (!huntGroupId) {
      return this.$q.resolve(new HuntGroup());
    } else {
      return this.huntGroupResource.get({
        customerId: this.Authinfo.getOrgId(),
        huntGroupId: huntGroupId,
      }).$promise
      .then( (huntGroupResource) => {
        let huntGroup = new HuntGroup(_.pick<HuntGroup, HuntGroup>(huntGroupResource, this.huntGroupProperties));

        // TODO (jlowery): remove when CMI normalizes fallbackDestination payloads across APIs
        huntGroup.fallbackDestination = new FallbackDestination({
          memberUuid: _.get<string>(huntGroupResource.fallbackDestination, 'userUuid'),
          name: _.get<string>(huntGroupResource.fallbackDestination, 'userName'),
          number: _.get<string>(huntGroupResource.fallbackDestination, 'number'),
          numberUuid: _.get<string>(huntGroupResource.fallbackDestination, 'numberUuid'),
          sendToVoicemail: _.get<boolean>(huntGroupResource.fallbackDestination, 'sendToVoicemail'),
        });

        let huntGroupMembers: Array<CallFeatureMember> = this.consolidateMembers(huntGroupResource.members);
        let promises: Array<ng.IPromise<CallFeatureMember>> = [];
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
  private consolidateMembers(members: Array<CallFeatureMember>): Array<CallFeatureMember> {
    let consolidatedMembers: Array<CallFeatureMember> = [];
    let groupedMembers = _.groupBy(members, 'numberUuid');
    _.forEach(groupedMembers, group => {
      if (group.length > 1) {
        let sharedLine = new CallFeatureMember({
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
        return {
          number: number.number,
          type: number.type === NumberType.INTERNAL ? NUMBER_FORMAT_EXTENSION : NUMBER_FORMAT_DIRECT_LINE,
        };
      }),
      members: _.map(data.members, (member) => {
        return member.uuid;
      }),
    }, (_response, headers) => {
      location = headers('Location');
    }).$promise
    .then( () => location);
  }

  public updateHuntGroup(huntGroupId: string, data: HuntGroup): ng.IPromise<HuntGroup> {
    return this.huntGroupResource.update({
      customerId: this.Authinfo.getOrgId(),
      huntGroupId: huntGroupId,
    }, {
      name: data.name,
      huntMethod: data.huntMethod,
      maxRingSecs: data.maxRingSecs,
      maxWaitMins: data.maxWaitMins,
      fallbackDestination: {
        number: data.fallbackDestination.number,
        numberUuid: data.fallbackDestination.numberUuid,
        sendToVoicemail: data.fallbackDestination.sendToVoicemail,
      },
      numbers: _.map(data.numbers, (number) => {
        return {
          number: number.number,
          type: number.type === NumberType.INTERNAL ? NUMBER_FORMAT_EXTENSION : NUMBER_FORMAT_DIRECT_LINE,
        };
      }),
      members: _.map(data.members, (member) => {
        // return member.memberUuid;
        return member.uuid;
      }),
    }).$promise
    .then( () => {
      return this.getHuntGroup(huntGroupId);
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
