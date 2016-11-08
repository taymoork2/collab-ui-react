import { Member, USER_REAL_USER } from 'modules/huron/members';
import { IMemberWithPicture } from 'modules/huron/features/pagingGroup';

class PagingGroupMemberCtrl implements ng.IComponentController {
  public memberName: string;
  public selectedMembers: IMemberWithPicture[];
  public errorMemberInput: boolean = false;
  public availableMembers: Member[] = [];
  private onUpdate: Function;
  private cardThreshold: number;
  public numberOfCards: number | undefined = this.cardThreshold;

  /* @ngInject */
  constructor(private FeatureMemberService,
              private Notification) {
  }

  public selectMembers(member: Member): void {
    if (member) {
      this.memberName = '';
      let memberWithPicture: IMemberWithPicture = {
        member: member,
        picturePath: '',
      };

      if (member.type === USER_REAL_USER) {
        this.FeatureMemberService.getUser(member.uuid).then(
          (user) => {
            memberWithPicture.member.firstName = this.FeatureMemberService.getFirstNameFromUser(user);
            memberWithPicture.member.lastName = this.FeatureMemberService.getLastNameFromUser(user);
            memberWithPicture.member.displayName = this.FeatureMemberService.getDisplayNameFromUser(user);
            memberWithPicture.member.userName = this.FeatureMemberService.getUserNameFromUser(user);
            memberWithPicture.picturePath = this.FeatureMemberService.getUserPhoto(user);
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
    let index = _.findIndex(this.selectedMembers, function (mem) {
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

  public fetchMembers(): void {
    if (this.fetchMembers && this.memberName.length >= 3) {
      this.FeatureMemberService.getMemberSuggestions(this.memberName).then(
        (data: Member[]) => {
          this.availableMembers = _.reject(data, (mem) => {
              return _.some(this.selectedMembers, (member) => {
                return _.get(member, 'member.uuid') === mem.uuid;
              });
            });
          this.errorMemberInput = (this.availableMembers && this.availableMembers.length === 0);
        }, (response) => {
          this.Notification.errorResponse(response, 'pagingGroup.memberFetchFailure');
        });
    }
  }

  public showMemberCounts(): boolean {
    return (this.selectedMembers.length > this.cardThreshold);
  }
}

export class PgMemberComponent implements ng.IComponentOptions {
  public controller = PagingGroupMemberCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/pgSetupAssistant/pgMember/pgMember.html';
  public bindings = {
    onUpdate: '&',
    selectedMembers: '<',
    cardThreshold: '@',
  };
}
