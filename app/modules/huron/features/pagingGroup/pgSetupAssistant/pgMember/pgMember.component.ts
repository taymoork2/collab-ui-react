import { Member, USER_REAL_USER, USER_PLACE } from 'modules/huron/members';
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

      this.FeatureMemberService.getMemberPicture(member.uuid).then(
        (avatar) => {
          memberWithPicture.picturePath = avatar;
      });

      this.selectedMembers.unshift(memberWithPicture);
      this.onUpdate({
        members: this.selectedMembers,
      });
    }
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

  public getFirstLastName(member: Member) {
    if (!member) {
      return '';
    }

    if (member.firstName && member.lastName) {
      return member.firstName + ' ' + member.lastName;
    } else if (member.firstName) {
      return member.firstName;
    } else if (member.lastName) {
      return member.lastName;
    } else {
      return '';
    }
  }

  public getUserName(member: Member) {
    if (!member) {
      return '';
    }

    if (member.userName) {
      return member.userName;
    } else {
      return '';
    }
  }

  public getMemberType(member: Member) {
    if (!member) {
      return '';
    }

    if (member.type === USER_REAL_USER) {
      return 'user';
    } else if (member.type === USER_PLACE) {
      return 'place';
    } else {
      return '';
    }
  }

  public getDisplayNameInDropdown(member: Member) {
    if (!member) {
      return '';
    }
    let name = '';

    if (member.type === USER_REAL_USER) {
      let firstLastName = this.getFirstLastName(member);
      if (firstLastName !== '') {
        name = (firstLastName + ' (' + this.getUserName(member) + ')');
      } else {
        name = this.getUserName(member);
      }
    } else if (member.type === USER_PLACE && member.displayName) {
      name = member.displayName;
    }
    return name;
  }

  public getDisplayNameOnCard(member: Member) {
    if (!member) {
      return '';
    }

    let name = '';
    if (member.type === USER_REAL_USER) {
      if (this.getFirstLastName(member) !== '') {
        name = (this.getFirstLastName(member));
      } else {
        name = this.getUserName(member);
      }
    } else if (member.type === USER_PLACE && member.displayName) {
      name = member.displayName;
    }
    return name;
  }

  public fetchMembers(): void {
    if (this.fetchMembers && this.memberName.length >= 3) {
      this.FeatureMemberService.getMemberSuggestions(this.memberName).then(
        (data: Member[]) => {
          this.availableMembers = _.reject(data, (mem) => {
            return _.some(this.selectedMembers, { member: mem });
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
