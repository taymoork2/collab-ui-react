import { Member } from 'modules/huron/members';
import { IMember, IPickupGroup, IMemberNumber, ICallPickupNumbers } from 'modules/huron/features/callPickup/services';
import { Notification } from 'modules/core/notifications';
import { CallPickupGroupService } from 'modules/huron/features/callPickup/services/callPickupGroup.service';

class CallPickupMembersCtrl implements ng.IComponentController {
  public memberList: Member[] = [];
  public selectedMembers: IMember[];
  private onUpdate: Function;
  private onEditUpdate: Function;
  public errorMemberInput: boolean = false;
  public memberName: string;
  private maxMembersAllowed: number = parseInt(this.$translate.instant('callPickup.maxMembersAllowed'), 10) || 30;
  public readonly removeText = this.$translate.instant('callPickup.removeMember');
  public isNew: boolean;
  public savedCallPickup: IPickupGroup;
  /* @ngInject */
  constructor(
    private Notification: Notification,
    private FeatureMemberService,
    private $translate: ng.translate.ITranslateService,
    private CallPickupGroupService: CallPickupGroupService,
  ) { }

  public fetchMembers(): void {
    if (this.memberName) {
      this.FeatureMemberService.getMemberSuggestions(this.memberName)
      .then(
        (members: Member[]) => {
          this.memberList = _.reject(members, mem => _.some(this.selectedMembers, member =>
           member.member.uuid === mem.uuid ));
          this.errorMemberInput = (this.memberList && this.memberList.length === 0);
        });
    }
  }

  public selectMember(member: Member): void {
    let isValid = this.CallPickupGroupService.verifyLineSelected(this.selectedMembers);
    this.memberName = '';
    if (this.selectedMembers.length < this.maxMembersAllowed) {
      let memberData: IMember = {
        member: member,
        picturePath: '',
        checkboxes: [],
        saveNumbers: [],
      };

      let numbersPromise = this.CallPickupGroupService.getMemberNumbers(member.uuid);
      this.FeatureMemberService.getMemberPicture(member.uuid).then(
        avatar => memberData.picturePath = avatar.thumbnailSrc
      );
      let scope = this;
      numbersPromise
      .then(
        (data: IMemberNumber[]) => {
        memberData.saveNumbers.push(scope.getPrimaryNumber(data));
        memberData.checkboxes = scope.CallPickupGroupService.createCheckBoxes(memberData, data);
        scope.selectedMembers.push(memberData);
        if (!scope.isNew) {
          scope.updateExistingCallPickup('select');
        }
        scope.onUpdate({
          member: scope.selectedMembers,
          isValidMember: isValid,
        });
      });
    } else {
      this.Notification.error('callPickup.memberLimitExceeded');
    }
    this.memberList = [];
  }

  private updateExistingCallPickup(action: string) {
    let scope = this;
    let newSaveNumbers: any[];
    if (action === 'remove') {
      newSaveNumbers = [];
      _.forEach(scope.selectedMembers, function(member) {
        newSaveNumbers.push(_.map(member.saveNumbers, 'uuid'));
      });
      newSaveNumbers = _.flatten(newSaveNumbers);
      scope.savedCallPickup.numbers = newSaveNumbers;
    } else if (action === 'select') {
      newSaveNumbers = [];
      _.forEach(scope.selectedMembers, function(member) {
        _.forEach(member.saveNumbers, function(number){
          if (_.indexOf(scope.savedCallPickup.numbers, number.uuid) === -1) {
            scope.savedCallPickup.numbers.push(number.uuid);
          }
        });
      });
    }
    this.onEditUpdate({
      savedCallPickup: this.savedCallPickup,
    });
  }

  public updateNumbers(member: IMember): void {
    let scope = this;
    _.forEach( member.checkboxes, function(checkbox){
      let internalNumber = checkbox.label.split('&')[0].trim();
      if (checkbox.value === false) {
        _.remove( member.saveNumbers, function(number) {
          return number.internalNumber === internalNumber;
        });
        if (!scope.isNew) {
           scope.updateExistingCallPickup('remove');
        }
      } else if (!_.findKey(member.saveNumbers, { internalNumber: internalNumber.trim() })) {
          let saveNumber: ICallPickupNumbers = {
            uuid: checkbox.numberUuid,
            internalNumber: checkbox.label.split('&')[0].trim(),
          };
          member.saveNumbers.push(saveNumber);
          if (!scope.isNew) {
            scope.updateExistingCallPickup('select');
          }
      }
    });
    if (!this.CallPickupGroupService.verifyLineSelected(this.selectedMembers)) {
      scope.Notification.error('callPickup.minMemberWarning');
    }
    scope.onUpdate({
      member: scope.selectedMembers,
      isValidMember: this.CallPickupGroupService.verifyLineSelected(this.selectedMembers),
    });
  }

  private getPrimaryNumber(numbers: IMemberNumber[]): ICallPickupNumbers {
    let saveNumbers: ICallPickupNumbers = {
          uuid: _.find(numbers, { primary : true }).uuid,
          internalNumber: _.find(numbers, { primary : true }).internal,
    };
    return saveNumbers;
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
        isValidMember: this.CallPickupGroupService.verifyLineSelected(this.selectedMembers),
      });
      if (!this.isNew) {
        this.updateExistingCallPickup('remove');
      }
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
    isNew: '<',
    savedCallPickup: '<',
    onEditUpdate: '&',
  };
}
