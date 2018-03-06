import { IPagingGroup, PagingGroup, PagingGroupNumber, PagingNumberService, PagingGroupService } from 'modules/call/features/paging-group/shared';
import { MemberType } from 'modules/huron/members';
import { CallFeatureMember } from 'modules/call/features/shared/call-feature-members';
import { FeatureMemberService } from 'modules/huron/features/services';
import { Notification } from 'modules/core/notifications';

export class PagingGroupSettingsService {
  private pagingGroupCopy: PagingGroup;
  private missingMembers: boolean = false;
  private missingInitiators: boolean = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private PagingGroupService: PagingGroupService,
    private PagingNumberService: PagingNumberService,
    private FeatureMemberService: FeatureMemberService,
    private Notification: Notification,
  ) {}

  public listPagingGroupsWithNumberData() {
    return this.PagingGroupService.listPagingGroups()
      .then(pagingGroups => {
        const promises: ng.IPromise<any>[] = [];
        _.forEach(pagingGroups, pagingGroupListItem => {
          promises.push(this.getNumberExtension(_.get(pagingGroupListItem, 'groupId', ''))
            .then(number => {
              if (number) {
                pagingGroupListItem.extension = number;
              } else {
                this.Notification.error('pagingGroup.errorGetNumber', { pagingGroupName: pagingGroupListItem.name });
              }
            }));
        });
        return this.$q.all(promises)
          .then(() => pagingGroups)
          .catch(error => this.Notification.errorWithTrackingId(error, 'pagingGroup.loadError'));
      });
  }

  public get(pagingGroupId: string) {
    return this.getPagingGroup(pagingGroupId)
      .then(pagingGroup => {
        this.pagingGroupCopy = this.clonePagingGroupData(pagingGroup);
        return pagingGroup;
      });
  }

  private getPagingGroup(uuid: string): ng.IPromise<PagingGroup> {
    if (uuid) {
      return this.PagingGroupService.getPagingGroup(uuid)
        .then(pagingGroup => this.getNumberExtension(pagingGroup.groupId || '')
        .then(extension => {
          if (extension) {
            pagingGroup.extension = extension.number;
          } else {
            this.Notification.error('pagingGroup.errorGetNumber', { pagingGroupName: pagingGroup.name });
          }
        })
        .then(() => this.getMembers(pagingGroup)
          .then(members => pagingGroup.members = members))
        .then(() => this.getInitiators(pagingGroup))
          .then(initiators => {
            pagingGroup.initiators = initiators;
            if (this.missingInitiators || this.missingMembers) {
              this.PagingGroupService.updatePagingGroup(pagingGroup); //Found out of Sync between UPDM and PagingService, update PagingService to fix it
            }
            return pagingGroup;
          })
        .catch(error => {
          this.Notification.errorWithTrackingId(error, 'pagingGroup.loadError');
          return this.$q.reject();
        }));
    } else {
      return this.$q.resolve(new PagingGroup());
    }
  }

  public savePagingGroup(pagingGroup: IPagingGroup): IPromise<PagingGroup> {
    // if extension is not changed, don't send it in PUT payload.
    if (pagingGroup.extension === this.pagingGroupCopy.extension) {
      pagingGroup.extension = undefined;
    }
    return this.PagingGroupService.updatePagingGroup(pagingGroup)
      .then(() => this.get(pagingGroup.groupId || ''))
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'pagingGroup.errorSave', {
          pagingGroupName: pagingGroup.name,
        });
        return this.$q.reject();
      });
  }

  private getNumberExtension(uuid: string): ng.IPromise<PagingGroupNumber | undefined> {
    return this.PagingNumberService.getNumbers(uuid)
      .then(numbers => {
        if (_.isArray(numbers) && numbers.length > 0) {
          return numbers[0];
        } else {
          return undefined;
        }
      });
  }

  private getMembers(pagingGroup: PagingGroup): ng.IPromise<CallFeatureMember[]> {
    const members: CallFeatureMember[] = [];
    const promises: ng.IPromise<any>[] = [];
    this.missingMembers = false;
    _.forEach(pagingGroup.members, pgMember => {
      if (pgMember.type === MemberType.USER_REAL_USER) {
        promises.push(this.getUserMember(pgMember.uuid)
          .then(member => {
            return this.FeatureMemberService.getMemberPicture(member.uuid || '')
              .then(response => {
                member.thumbnailSrc = _.get(response, 'thumbnailSrc', undefined);
                members.push(member);
              })
              .catch(() => members.push(member));
          })
          .catch(error => {
            if (error && error.status === 404) {
              this.missingMembers = true;
            }
          }));
      } else if (pgMember.type === MemberType.USER_PLACE)  {
        promises.push(this.getPlaceMember(pgMember.uuid)
          .then(member => members.push(member))
          .catch(error => {
            if (error && error.status === 404) {
              this.missingMembers = true;
            }
          }));
      }
    });
    return this.$q.all(promises).then(() => members);
  }

  private getInitiators(pagingGroup: PagingGroup): ng.IPromise<CallFeatureMember[]> {
    const initiators: CallFeatureMember[] = [];
    const promises: ng.IPromise<any>[] = [];
    this.missingInitiators = false;
    _.forEach(pagingGroup.initiators, initiator => {
      if (initiator.type === MemberType.USER_REAL_USER) {
        promises.push(this.getUserMember(initiator.uuid)
        .then(member => {
          return this.FeatureMemberService.getMemberPicture(member.uuid || '')
            .then(response => {
              member.thumbnailSrc = _.get(response, 'thumbnailSrc', undefined);
              initiators.push(member);
            })
            .catch(() => initiators.push(member));
        })
        .catch(error => {
          if (error && error.status === 404) {
            this.missingMembers = true;
          }
        }));
      } else if (initiator.type === MemberType.USER_PLACE)  {
        promises.push(this.getPlaceMember(initiator.uuid)
          .then(member => initiators.push(member))
          .catch(error => {
            if (error && error.status === 404) {
              this.missingInitiators = true;
            }
          }));
      }
    });
    return this.$q.all(promises).then(() => initiators);
  }

  private getUserMember(userId: string) {
    return this.PagingGroupService.getUserMember(userId);
  }

  private getPlaceMember(placeId: string) {
    return this.PagingGroupService.getPlaceMember(placeId);
  }

  private clonePagingGroupData(pagingGroupData: PagingGroup): PagingGroup {
    return _.cloneDeep(pagingGroupData);
  }

  public getOriginalConfig(): PagingGroup {
    return this.clonePagingGroupData(this.pagingGroupCopy);
  }

  public matchesOriginalConfig(pagingGroup: PagingGroup): boolean {
    return _.isEqual(pagingGroup, this.pagingGroupCopy);
  }
}
