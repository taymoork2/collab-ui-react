import { CallPark } from './call-park';
import { CallFeatureMember, CardType } from 'modules/call/features/shared/call-feature-members/call-feature-member';
import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';
import { MemberType, USER_PLACE } from 'modules/huron/members';
import { FeatureMemberService } from 'modules/huron/features/services';

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

export class CallParkService {
  private callParkResource: ICallParkResource;
  private callParkRangeResource: ICallParkRangeResource;
  private locationCallParkRangeResource: ICallParkRangeResource;
  private callParkDataCopy: CallPark;
  private callParkProperties: string[] = ['uuid', 'name', 'startRange', 'endRange', 'members', 'fallbackTimer', 'location'];
  private fallbackDestProperties: string[] = ['memberUuid', 'name', 'number', 'numberUuid', 'sendToVoicemail', 'timer'];

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private $q: ng.IQService,
    private Authinfo,
    private HuronConfig,
    private FeatureMemberService: FeatureMemberService,
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

    this.callParkResource = <ICallParkResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/callparks/:callParkId', {},
      {
        update: updateAction,
        save: saveAction,
      });

    this.callParkRangeResource = <ICallParkRangeResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/callparks/ranges/:startRange');
    this.locationCallParkRangeResource = <ICallParkRangeResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/locations/:locationId/features/callparks/ranges/:startRange');
  }

  public getCallParkList(): ng.IPromise<ICallParkListItem[]> {
    return this.callParkResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then( callParks => {
      return _.get<ICallParkListItem[]>(callParks, 'callparks');
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
        const callPark = new CallPark(_.pick<CallPark, CallPark>(callParkResource, this.callParkProperties));
        callPark.fallbackDestination = new FallbackDestination(_.pick<FallbackDestination, FallbackDestination>(callParkResource.fallbackDestination, this.fallbackDestProperties));
        // The timer property is not in GET callpark and needs to be set to null to be consistent.
        callPark.fallbackDestination.timer = null;

        const callParkMembers: CallFeatureMember[] = _.map(callParkResource.members, member => {
          return new CallFeatureMember({
            uuid: _.get<string>(member, 'memberUuid'),
            name: _.get<string>(member, 'memberName'),
            showName: true,
            type: _.get<string>(member, 'memberType') === USER_PLACE ? MemberType.USER_PLACE : MemberType.USER_REAL_USER,
            cardType: CardType.SIMPLE,
            complexCardType: undefined,
            number: _.get<string>(member, 'number'),
            memberItems: [],
            memberItemId: _.get<string>(member, 'numberUuid'),
            thumbnailSrc: undefined,
          });
        });
        const promises: ng.IPromise<CallFeatureMember>[] = [];
        _.forEach(callParkMembers, member => {
          promises.push(this.FeatureMemberService.getMemberPicture(member.uuid)
            .then(response => {
              member.thumbnailSrc = _.get(response, 'thumbnailSrc', undefined);
              return member;
            })
            .catch( () => {
              return member;
            }));
        });

        return this.$q.all(promises).then( (callParkMembers) => {
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
      locationUuid: _.get(data, 'location.uuid'),
      name: data.name,
      startRange: data.startRange,
      endRange: data.endRange,
      members: _.map(data.members, (member) => {
        return member.uuid;
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
      // TODO: samwi - enable when ready
      // locationUuid: _.get(data, 'location.uuid'),
      name: data.name,
      startRange: data.startRange,
      endRange: data.endRange,
      members: _.map(data.members, (member) => {
        return member.uuid;
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

  public getRangeList(location?): ng.IPromise<ICallParkRangeItem[]> {
    if (location) {
      return this.locationCallParkRangeResource.get({
        customerId: this.Authinfo.getOrgId(),
        locationId: location.uuid,
      }).$promise
      .then( ranges => {
        return _.get<ICallParkRangeItem[]>(ranges, 'ranges', []);
      });
    } else {
      return this.callParkRangeResource.get({
        customerId: this.Authinfo.getOrgId(),
      }).$promise
      .then( ranges => {
        return _.get<ICallParkRangeItem[]>(ranges, 'ranges', []);
      });
    }
  }

  public getEndRange(startRange: string, location?): ng.IPromise<string[]> {
    if (location) {
      return this.locationCallParkRangeResource.get({
        customerId: this.Authinfo.getOrgId(),
        locationId: location.uuid,
        startRange: startRange,
      }).$promise
      .then( endRanges => {
        return _.get<string[]>(endRanges, 'endRange', []);
      });
    } else {
      return this.callParkRangeResource.get({
        customerId: this.Authinfo.getOrgId(),
        startRange: startRange,
      }).$promise
      .then( endRanges => {
        return _.get<string[]>(endRanges, 'endRange', []);
      });
    }
  }

  private cloneCallParkData(callParkData: CallPark): CallPark {
    return _.cloneDeep(callParkData);
  }

}
