import { CallPark, CallParkMember, FallbackDestination } from './callPark';
import { Member, MemberType, USER_PLACE } from 'modules/huron/members';
import { FeatureMemberService, IFeatureMemberPicture } from 'modules/huron/features';

export interface ICallParkListItem {
  uuid: string;
  name: string;
  startRange: string;
  endRange: string;
  memberCount: number;
}

export interface ICallParkRangeItem {
  startRange: string;
  endRange: string;
}

interface ICallParkResource extends ng.resource.IResourceClass<ng.resource.IResource<CallPark>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface ICallParkRangeResource extends ng.resource.IResourceClass<ng.resource.IResource<ICallParkRangeItem>> {}

interface IDirectoryNumberResource extends ng.resource.IResourceClass<ng.resource.IResource<string>> {}

export class CallParkService {
  private callParkResource: ICallParkResource;
  private callParkRangeResource: ICallParkRangeResource;
  private directoryNumberResource: IDirectoryNumberResource;
  private callParkDataCopy: CallPark;
  private callParkProperties: Array<string> = ['uuid', 'name', 'startRange', 'endRange', 'members', 'fallbackTimer'];
  private fallbackDestProperties: Array<string> = ['memberUuid', 'name', 'number', 'numberUuid', 'sendToVoicemail'];

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private $q: ng.IQService,
    private Authinfo,
    private HuronConfig,
    private FeatureMemberService: FeatureMemberService,
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

    this.callParkResource = <ICallParkResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/callparks/:callParkId', {},
      {
        update: updateAction,
        save: saveAction,
      });

    this.callParkRangeResource = <ICallParkRangeResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/callparks/ranges/:startRange');
    this.directoryNumberResource = <IDirectoryNumberResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId');
  }

  public getCallParkList(): ng.IPromise<Array<ICallParkListItem>> {
    return this.callParkResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then( callParks => {
      return _.get<Array<ICallParkListItem>>(callParks, 'callparks');
    });
  }

  public getCallPark(callParkId): ng.IPromise<CallPark> {
    if (!callParkId) {
      return this.$q.resolve(new CallPark());
    } else {
      return this.callParkResource.get({
        customerId: this.Authinfo.getOrgId(),
        callParkId: callParkId,
      }).$promise
      .then( (callParkResource) => {
        let callPark = new CallPark(_.pick<CallPark, CallPark>(callParkResource, this.callParkProperties));
        callPark.fallbackDestination = new FallbackDestination(_.pick<FallbackDestination, FallbackDestination>(callParkResource.fallbackDestination, this.fallbackDestProperties));

        let callParkMembers: Array<CallParkMember> = [];
        let promises: Array<ng.IPromise<IFeatureMemberPicture>> = [];
        _.forEach<any>(callParkResource.members, member => {
          callParkMembers.push(new CallParkMember({
              memberUuid: member.memberUuid,
              memberName: member.memberName,
              memberType: member.memberType === USER_PLACE ? MemberType.USER_PLACE : MemberType.USER_REAL_USER,
              number: member.number,
              numberUuid: member.numberUuid,
              thumbnailSrc: undefined,
            }));
          promises.push(this.FeatureMemberService.getMemberPicture(member.memberUuid).catch( () => {
            return <IFeatureMemberPicture>{
              memberUuid: member.memberUuid,
              thumbnailSrc: undefined,
            };
          }));
        });

        return this.$q.all(promises).then(responses => {
          _.forEach(callParkMembers, callParkMember => {
            callParkMember.thumbnailSrc = _.get(_.find(responses, { memberUuid: callParkMember.memberUuid }), 'thumbnailSrc', undefined);
          });
          callPark.members = callParkMembers;
          return callPark;
        });

      }).then(callPark => {
        this.callParkDataCopy = this.cloneCallParkData(callPark);
        return callPark;
      });
    }
  }

  public getOriginalConfig(): CallPark {
    return this.cloneCallParkData(this.callParkDataCopy);
  }

  public matchesOriginalConfig(callPark: CallPark): boolean {
    return _.isEqual(callPark, this.callParkDataCopy);
  }

  public createCallPark(data: CallPark): ng.IPromise<string> {
    let location: string;
    return this.callParkResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      name: data.name,
      startRange: data.startRange,
      endRange: data.endRange,
      members: _.map(data.members, (member) => {
        return member.memberUuid;
      }),
    }, (_response, headers) => {
      location = headers('Location');
    }).$promise
    .then( () => location);
  }

  public updateCallPark(callParkId: string | undefined, data: CallPark): ng.IPromise<CallPark> {
    return this.callParkResource.update({
      customerId: this.Authinfo.getOrgId(),
      callParkId: callParkId,
    }, {
      name: data.name,
      startRange: data.startRange,
      endRange: data.endRange,
      members: _.map(data.members, (member) => {
        return member.memberUuid;
      }),
      fallbackTimer: data.fallbackTimer,
      fallbackDestination: {
        number: data.fallbackDestination.number,
        numberUuid: data.fallbackDestination.numberUuid,
        sendToVoicemail: data.fallbackDestination.sendToVoicemail,
      },
    }).$promise
    .then( () => {
      return this.getCallPark(callParkId);
    });
  }

  public deleteCallPark(callParkId: string): ng.IPromise<any> {
    return this.callParkResource.delete({
      customerId: this.Authinfo.getOrgId(),
      callParkId: callParkId,
    }).$promise;
  }

  public getRangeList(): ng.IPromise<Array<ICallParkRangeItem>> {
    return this.callParkRangeResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then( ranges => {
      return _.get<Array<ICallParkRangeItem>>(ranges, 'ranges', []);
    });
  }

  public getEndRange(startRange: string): ng.IPromise<Array<string>> {
    return this.callParkRangeResource.get({
      customerId: this.Authinfo.getOrgId(),
      startRange: startRange,
    }).$promise
    .then( endRanges => {
      return _.get<Array<string>>(endRanges, 'endRange', []);
    });
  }

  public getDirectoryNumber(numberUuid): ng.IPromise<any> {
    return this.directoryNumberResource.get({
      customerId: this.Authinfo.getOrgId(),
      directoryNumberId: numberUuid,
    }).$promise;
  }

  public getDisplayName(member: Member): string {
    if (member.displayName) {
      return member.displayName;
    } else if (!member.firstName && !member.lastName && member.userName) {
      return member.userName;
    } else if (member.firstName && member.lastName) {
      return member.firstName + ' ' + member.lastName;
    } else if (member.firstName) {
      return member.firstName;
    } else if (member.lastName) {
      return member.lastName;
    } else {
      return '';
    }
  }

  private cloneCallParkData(callParkData: CallPark): CallPark {
    return _.cloneDeep(callParkData);
  }

}
