import { Member, USER_REAL_USER, USER_PLACE } from 'modules/huron/members';
import { IMemberWithPicture } from 'modules/call/features/paging-group/shared';

class PagingGroupMemberCtrl implements ng.IComponentController {
  public memberName: string;
  public selectedMembers: IMemberWithPicture[];
  public errorMemberInput: boolean = false;
  public availableMembers: Member[] = [];
  private onUpdate: Function;
  private cardThreshold: number;
  public numberOfCards: number | undefined = this.cardThreshold;

  /* @ngInject */
  constructor(
    private FeatureMemberService,
    private Notification,
    private $q: ng.IQService,
  ) {}

  public selectMembers(member: Member): void {
    if (member) {
      this.memberName = '';
      const memberWithPicture: IMemberWithPicture = {
        member: member,
        picturePath: '',
      };

      if (member.type === USER_REAL_USER) {
        this.FeatureMemberService.getUser(member.uuid).then(
          (user) => {
            this.FeatureMemberService.populateFeatureMemberInfo(memberWithPicture, user);
          });
      }
      this.selectedMembers.unshift(memberWithPicture);
      this.onUpdate({
        members: this.selectedMembers,
      });
    }
    this.availableMembers = [];
  }

  public getMembersPictures(member: Member): string {
    const index = _.findIndex(this.selectedMembers, function (mem) {
      return (mem.member.uuid === member.uuid);
    });
    if (index !== -1) {
      return this.selectedMembers[index].picturePath;
    } else {
      return '';
    }
  }

  public removeMembers(member: IMemberWithPicture): void {
    if (member) {
      this.selectedMembers = _.reject(this.selectedMembers, member);
      this.onUpdate({
        members: this.selectedMembers,
      });
    }
  }

  public getMemberType(member: Member) {
    return this.FeatureMemberService.getMemberType(member);
  }

  public getDisplayNameInDropdown(member: Member) {
    return this.FeatureMemberService.getFullNameFromMember(member);
  }

  public getDisplayNameOnCard(member: Member) {
    return this.FeatureMemberService.getDisplayNameFromMember(member);
  }

  public getUserName(member: Member) {
    return this.FeatureMemberService.getUserName(member);
  }

  public fetchMembers(): ng.IPromise<Member[]> {
    return this.FeatureMemberService.getMemberSuggestions(this.memberName).then(
      (data: Member[]) => {
        this.availableMembers = _.reject(data, (mem) => {
          return _.some(this.selectedMembers, (member) => {
            return _.get(member, 'member.uuid') === mem.uuid;
          });
        });

        const promises: ng.IPromise<any>[] = [];
        _.forEach(this.availableMembers, (item: any): void => {
          // If Place is a room device type, remove from availableMembers
          if (item.type === USER_PLACE) {
            promises.push(this.FeatureMemberService.getMachineAcct(item.uuid).then(
              (data) => {
                if (data.machineType === 'lyra_space') {
                  this.availableMembers = _.reject(this.availableMembers, item);
                }
              }).catch(() => {
                this.availableMembers = _.reject(this.availableMembers, item);
              }));
          }
        });

        return this.$q.all(promises).then(() => {
          this.errorMemberInput = (this.availableMembers && this.availableMembers.length === 0);
          return this.availableMembers;
        });

      },
      (response) => {
        this.Notification.errorResponse(response, 'pagingGroup.memberFetchFailure');
      });
  }

  public showMemberCounts(): boolean {
    return (this.selectedMembers.length > this.cardThreshold);
  }
}

export class PgMemberComponent implements ng.IComponentOptions {
  public controller = PagingGroupMemberCtrl;
  public template = require('modules/call/features/paging-group/paging-group-setup-assistant/paging-group-member/paging-group-member.component.html');
  public bindings = {
    onUpdate: '&',
    selectedMembers: '<',
    cardThreshold: '@',
  };
}
