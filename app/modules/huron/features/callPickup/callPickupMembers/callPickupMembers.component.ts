import { Member } from 'modules/huron/members';
import { IMember, IMemberNumber, ICardMemberCheckbox, ICallPickupNumbers } from 'modules/huron/features/callPickup/services';
import { Notification } from 'modules/core/notifications';

class CallPickupMembersCtrl implements ng.IComponentController {
  public memberList: Member[] = [];
  public selectedMembers: IMember[];
  private onUpdate: Function;
  public errorMemberInput: boolean = false;
  public memberName: string;
  private maxMembersAllowed: number = parseInt(this.$translate.instant('callPickup.maxMembersAllowed'), 10) || 30;
  public readonly removeText = this.$translate.instant('callPickup.removeMember');

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private FeatureMemberService,
    private $translate: ng.translate.ITranslateService,
    private UserNumberService,
    private Authinfo,
  ) { }

  public fetchMembers(): void {
    if (this.memberName) {
      this.FeatureMemberService.getMemberSuggestions(this.memberName)
      .then(
        (data: Member[]) => {
          this.memberList = _.reject(data, mem => _.some(this.selectedMembers, { member: mem }));
          this.errorMemberInput = (this.memberList && this.memberList.length === 0);
        });
    }
  }

  public selectMember(member: Member): void {
    this.memberName = '';
    if (this.selectedMembers.length < this.maxMembersAllowed) {
      let memberData: IMember = {
        member: member,
        picturePath: '',
        checkboxes: [],
        saveNumbers: [],
      };
      this.getMemberNumbers(member.uuid)
      .then(
        (data: IMemberNumber[]) => {
        memberData.saveNumbers.push(this.getPrimaryNumber(data));
        memberData.checkboxes = this.createCheckBoxes(memberData, data);
      });

      this.FeatureMemberService.getMemberPicture(member.uuid).then(
        avatar => memberData.picturePath = avatar.thumbnailSrc
      );
      this.selectedMembers.push(memberData);
      this.onUpdate({
        member: this.selectedMembers,
        isValidMember: true,
      });
    } else {
      this.Notification.error('callPickup.memberLimitExceeded');
    }
    this.memberList = [];
  }

  public updateNumbers(member: IMember): void {
    _.forEach( member.checkboxes, function(checkbox){
      let internalNumber = checkbox.label.split('&')[0];
      if (checkbox.value === false) {
        _.remove( member.saveNumbers, function(number) {
          return number.internalNumber === internalNumber;
        });
      } else if (!_.findKey(member.saveNumbers, { internalNumber: internalNumber })) {
          let saveNumber: ICallPickupNumbers = {
            uuid: checkbox.numberUuid,
            internalNumber: checkbox.label,
          };
          member.saveNumbers.push(saveNumber);
      }
    });
    if (!this.verifyLineSelected()) {
      this.Notification.error('callPickup.minMemberWarning');
    }
    this.onUpdate({
      member: this.selectedMembers,
      isValidMember: this.verifyLineSelected(),
    });
  }

  public getMemberNumbers(uuid: string): ng.IPromise<IMemberNumber[]> {
    return this.UserNumberService.get({
      customerId: this.Authinfo.getOrgId(),
      userId: uuid,
    }).$promise.then(
      (response) => {
        return _.get(response, 'numbers', []);
      });
  }

  private getPrimaryNumber(numbers: IMemberNumber[]): ICallPickupNumbers {
    let saveNumbers: ICallPickupNumbers = {
          uuid: _.find(numbers, { primary : true }).uuid,
          internalNumber: _.find(numbers, { primary : true }).internal,
    };
    return saveNumbers;
  }

  private createCheckBoxes(member: IMember, numbers: IMemberNumber[]): ICardMemberCheckbox[] {
    _.forEach(numbers, function(number, index){
        member.checkboxes[index] = {
          label: number.internal + (number.external ? ' & ' + number.external : '' ),
          sublabel: '',
          value: number.primary ? true : false,
          numberUuid: number.uuid,
        };
    });
    return member.checkboxes;
  }

  public verifyLineSelected(): boolean {
    let result = true;
    if (this.selectedMembers) {
      _.some(this.selectedMembers, function(member) {
        if (member.saveNumbers.length < 1) {
          result = false;
          return;
        }
      });
    }
    return result;
  }

  public getMemberType(member: Member): string {
    return this.FeatureMemberService.getMemberType(member);
  }

  public getMembersPictures(member): string {
    let index = _.findIndex(this.selectedMembers, mem => mem.member.uuid === member.uuid);
    if (index !== -1) {
      return this.selectedMembers[index].picturePath;
    } else {
      return '';
    }
  }

  public removeMember(member: IMember): void {
    if (member) {
      this.selectedMembers = _.reject(this.selectedMembers, member);
      this.onUpdate({
        member: this.selectedMembers,
        isValidMember: true,
      });
    }
  }

  public getUserName(member: Member) {
    return this.FeatureMemberService.getUserName(member);
  }

  public getDisplayName(member: Member) {
    return this.FeatureMemberService.getFullNameFromMember(member);
  }

  public getDisplayNameOnCard(member: Member) {
    return this.FeatureMemberService.getDisplayNameFromMember(member);
  }
}

export class CallPickupMembersComponent implements ng.IComponentOptions {
  public controller = CallPickupMembersCtrl;
  public templateUrl = 'modules/huron/features/callPickup/callPickupMembers/callPickupMembers.html';
  public bindings = {
    onUpdate: '&',
    selectedMembers: '<',
  };
}
