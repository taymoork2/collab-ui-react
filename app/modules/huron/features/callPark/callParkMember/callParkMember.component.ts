import { CallParkService, CallParkMember } from 'modules/huron/features/callPark/services';
import { MemberService, Member, MemberType, USER_PLACE } from 'modules/huron/members';
import { FeatureMemberService } from 'modules/huron/features';
import { Line } from 'modules/huron/lines/services/line';

class CallParkMemberCtrl implements ng.IComponentController {
  public members: Array<CallParkMember>;
  public isNew: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public selectedMember: Member | undefined;
  public errorMemberInput: boolean = false;

  /* @ngInject */
  constructor(
    private MemberService: MemberService,
    private CallParkService: CallParkService,
    private FeatureMemberService: FeatureMemberService,
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
    this.FeatureMemberService.getMemberPicture(member.uuid).then(featureMemberPicture => {
      this.addCallParkMember(member, _.get(featureMemberPicture, 'thumbnailSrc', undefined));
    }).catch( () => { // request for picture failed, but we don't care!
      this.addCallParkMember(member, undefined);
    });
  }

  private addCallParkMember(member: Member, thumbnailSrc: string | undefined): void {
    let primaryNumber = this.getPrimaryNumber(member);
    this.members.unshift(new CallParkMember({
      memberUuid: member.uuid,
      memberName: this.CallParkService.getDisplayName(member) || '',
      memberType: member.type === USER_PLACE ? MemberType.USER_PLACE : MemberType.USER_REAL_USER,
      number: primaryNumber.internal,
      numberUuid: primaryNumber.uuid,
      thumbnailSrc: thumbnailSrc,
    }));
    this.onMembersChanged(this.members);
  }

  public unSelectCallParkMember(member: CallParkMember): void {
    _.remove<CallParkMember>(this.members, (callParkMember) => {
      return callParkMember.memberUuid === member.memberUuid;
    });
    this.onMembersChanged(this.members);
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

  private getPrimaryNumber(member: Member): Line {
    return _.find<Line>(member.numbers, (item) => {
      return item.primary === true;
    });
  }

  public onHandleKeyPress($keyCode): void {
    this.onKeyPressFn({
      keyCode: $keyCode,
    });
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
