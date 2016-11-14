import { CallParkMember } from 'modules/huron/features/callPark/services';
import { MemberService, Member } from 'modules/huron/members';

class CallParkMemberCtrl implements ng.IComponentController {
  public members: Array<CallParkMember>;
  public isNew: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public selectedMember: Member | undefined;
  public openMemberPanelUuid: string | undefined = undefined;
  public errorMemberInput: boolean = false;

  /* @ngInject */
  constructor(
    private MemberService: MemberService,
  ) {}

  public getMemberList(value: string): ng.IPromise<Array<Member>> {
    return this.MemberService.getMemberList(value, true).then( members => {
      let filteredMembers = _.filter(members, (member) => {
        return this.isNewMember(member.uuid);
      });
      if (filteredMembers.length === 0) {
        this.errorMemberInput = true;
      } else {
        this.errorMemberInput = false;
      }
      return filteredMembers;
    });
  }

  public selectCallParkMember(member: Member): void {
    this.selectedMember = undefined;
    this.members.push(new CallParkMember({
      memberUuid: member.uuid,
      memberName: this.getDisplayName(member) || '',
    }));
    this.onMembersChanged(this.members);
  }

  public unSelectCallParkMember(member: CallParkMember): void {
    _.remove<CallParkMember>(this.members, (callParkMember) => {
      return callParkMember.memberUuid === member.memberUuid;
    });
    this.openMemberPanelUuid = undefined;
    this.onMembersChanged(this.members);
  }

  public toggleMemberPanel(member: CallParkMember): string | undefined {
    if (this.openMemberPanelUuid === member.memberUuid) {
      this.openMemberPanelUuid = undefined;
    } else {
      this.openMemberPanelUuid = member.memberUuid;
    }
    return this.openMemberPanelUuid;
  }

  private onMembersChanged(members: Array<CallParkMember>): void {
    this.onChangeFn({
      members: _.cloneDeep(members),
    });
  }

  private isNewMember(uuid: string): boolean {
    let existingMembers = _.find(this.members, (member) => {
      return member.memberUuid === uuid;
    });
    return _.isUndefined(existingMembers);
  }

  public onHandleKeyPress($keyCode): void {
    this.onKeyPressFn({
      keyCode: $keyCode,
    });
  }

  public getDisplayName(member: Member): string | undefined {
    if (!member) {
      return;
    }

    if (!member.firstName && !member.lastName) {
      return member.userName;
    } else if (member.firstName && member.lastName) {
      return member.firstName + ' ' + member.lastName;
    } else if (member.firstName) {
      return member.firstName;
    } else if (member.lastName) {
      return member.lastName;
    } else {
      return;
    }
  }

}

export class CallParkMemberComponent implements ng.IComponentOptions {
  public controller = CallParkMemberCtrl;
  public templateUrl = 'modules/huron/features/callPark/callParkMember/callParkMember.html';
  public bindings = {
    members: '<',
    isNew: '<',
    onChangeFn: '&',
    onKeyPressFn: '&',
  };
}
