import { IRPagingGroup, IPagingGroup, PagingGroup, PagingGroupListItem, PLACE, USER, IInitiatorData, IMemberData } from 'modules/call/features/paging-group/shared';
import { MemberType } from 'modules/huron/members';
import { CallFeatureMember, CardType } from 'modules/call/features/shared/call-feature-members';
import { HuronUserService, UserV2 } from 'modules/huron/users';
import { HuronPlaceService } from 'modules/huron/places';

interface IPagingGroupResource extends ng.resource.IResourceClass<ng.resource.IResource<IRPagingGroup>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class PagingGroupService {

  private pagingGroupResource: IPagingGroupResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronUserService: HuronUserService,
    private HuronPlaceService: HuronPlaceService,
    private HuronConfig,
    private Authinfo,
  ) {
    this.pagingGroupResource = <IPagingGroupResource>this.$resource(`${this.HuronConfig.getPgUrl()}/customers/:customerId/pagingGroups/:groupId`, {},
      {
        update: {
          method: 'PUT',
        },
      });
  }

  public listPagingGroups(): ng.IPromise<PagingGroupListItem[]> {
    return this.pagingGroupResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then(pagingGroups => {
      return _.map(_.get(pagingGroups, 'pagingGroups', []), pagingGroup => {
        return new PagingGroupListItem(pagingGroup);
      });
    });
  }

  public getPagingGroup(groupId: string): ng.IPromise<PagingGroup> {
    return this.pagingGroupResource.get({
      customerId: this.Authinfo.getOrgId(),
      groupId: groupId,
    }).$promise.then(pagingGroup => new PagingGroup(pagingGroup));
  }

  public savePagingGroup(pg: IPagingGroup) {
    return this.pagingGroupResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, pg).$promise;
  }

  public updatePagingGroup(pagingGroup: IPagingGroup) {
    return this.pagingGroupResource.update({
      customerId: this.Authinfo.getOrgId(),
      groupId: pagingGroup.groupId,
    }, {
      groupId: pagingGroup.groupId,
      name: pagingGroup.name,
      extension: pagingGroup.extension,
      members: _.map(pagingGroup.members, member => {
        return {
          memberId: member.uuid,
          deviceIds: [],
          type: member.type === MemberType.USER_PLACE ? PLACE : USER,
        } as IMemberData;
      }),
      initiatorType: pagingGroup.initiatorType,
      initiators: _.map(pagingGroup.initiators, initiator => {
        return {
          initiatorId: initiator.uuid,
          type: initiator.type === MemberType.USER_PLACE ? PLACE : USER,
        } as IInitiatorData;
      }),
    }).$promise;
  }

  public deletePagingGroup(groupId: string) {
    return this.pagingGroupResource.delete({
      customerId: this.Authinfo.getOrgId(),
      groupId: groupId,
    }).$promise;
  }

  public getUserMember(userId: string): ng.IPromise<CallFeatureMember> {
    return this.HuronUserService.getUserV2(userId)
      .then(user => {
        return new CallFeatureMember({
          uuid: _.get(user, 'uuid'),
          type: MemberType.USER_REAL_USER,
          name: this.formatUserName(user),
          showName: true,
          number: _.get(user, 'userName'),
          cardType: CardType.SIMPLE,
        });
      });
  }

  public getPlaceMember(placeId: string): ng.IPromise<CallFeatureMember> {
    return this.HuronPlaceService.getPlace(placeId)
      .then(place => {
        return new CallFeatureMember({
          uuid: _.get(place, 'uuid'),
          type: MemberType.USER_PLACE,
          name: _.get(place, 'displayName'),
          showName: true,
          number: '',
          cardType: CardType.SIMPLE,
        });
      });
  }

  private formatUserName(user: UserV2): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return  user.lastName;
    } else {
      return user.userName || '';
    }
  }
}
