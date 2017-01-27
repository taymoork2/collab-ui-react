import { IOption } from 'modules/huron/dialing/dialing.service';
import { AutoAnswerMember, AutoAnswerPhone } from 'modules/huron/autoAnswer';
import { AutoAnswerConst } from 'modules/huron/autoAnswer/autoAnswer.service';
import { MemberType, USER_REAL_USER } from 'modules/huron/members';

export class AutoAnswerCtrl implements ng.IComponentController {
  public onChangeFn: Function;
  public autoAnswerNoSupportedPhone: boolean;
  public autoAnswerEnabledForSharedLineMemberMsg: string;

  public autoAnswerEnabled: boolean;
  public autoAnswerPhoneOptions: IOption[];
  public autoAnswerPhoneSelected: IOption | undefined;
  public autoAnswerMode: string | null | undefined;
  private phoneList: Array<AutoAnswerPhone>;

  /* @ngInject */
  constructor (
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.autoAnswerNoSupportedPhone = false;
    this.autoAnswerEnabledForSharedLineMemberMsg = '';
    this.autoAnswerEnabled = false;
    this.phoneList = [];
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let autoAnswerChanges = changes['autoAnswer'];
    if (autoAnswerChanges) {
      this.processPhoneListChange(autoAnswerChanges);

      if (!this.autoAnswerNoSupportedPhone) {
        this.processAutoAnswerSelectionChange(autoAnswerChanges);
      }
    }
  }

  public onAutoAnswerOptionChange(): void {
    if (!_.isUndefined(this.autoAnswerPhoneSelected) && !_.isNull(this.autoAnswerPhoneSelected) &&
        !_.isUndefined(this.autoAnswerMode)) {
      this.change(this.autoAnswerPhoneSelected!.value, this.autoAnswerEnabled, this.autoAnswerMode);
    }
  }

  public onAutoAnswerToggleChange(value: boolean): void {
    if (value && this.autoAnswerPhoneSelected && this.autoAnswerMode) {
      this.change(this.autoAnswerPhoneSelected.value, value, this.autoAnswerMode);
    } else if (value && _.isUndefined(this.autoAnswerPhoneSelected) &&
               this.autoAnswerPhoneOptions && this.autoAnswerPhoneOptions.length === 1) {
      this.autoAnswerPhoneSelected = this.autoAnswerPhoneOptions[0];
    } else if (!value) {
      if (this.autoAnswerPhoneSelected) {
        this.change(this.autoAnswerPhoneSelected!.value, value, this.autoAnswerMode);
      } else {
        this.change(undefined, value, undefined);
      }
      this.autoAnswerPhoneSelected = undefined;
      this.autoAnswerMode = undefined;
    }
  }

  private processPhoneListChange(autoAnswerChanges: ng.IChangesObject): void {
      if (_.isUndefined(autoAnswerChanges.currentValue) || _.isNull(autoAnswerChanges.currentValue)) {
            this.autoAnswerNoSupportedPhone = true;
            return;
      }

      let _phoneList: Array<AutoAnswerPhone> = autoAnswerChanges.currentValue.phones;
      if (_.isUndefined(_phoneList) || _.isNull(_phoneList) || _phoneList.length === 0) {
        this.autoAnswerNoSupportedPhone = true;
        return;
      }

      if (!_.isEqual(this.phoneList, _phoneList)) {
        this.convertAutoAnswerPhonesToOptionsArray(_phoneList as Array<AutoAnswerPhone>);
        this.phoneList = _phoneList;
      }
  }

  private convertAutoAnswerPhonesToOptionsArray(autoAnswerPhones: Array<AutoAnswerPhone>): void {
    this.autoAnswerPhoneOptions = _.map(autoAnswerPhones, (phone) => {
      return { label: phone.description,
               value: phone.uuid };
    });
  }

  private getCustomSharedLineMemberWarningMsg(sharedLineMemeber: AutoAnswerMember): string {
    let memberInfo = (sharedLineMemeber.type === USER_REAL_USER) ? {
        type: MemberType.USER_REAL_USER,
        name: sharedLineMemeber.firstName + ' ' + sharedLineMemeber.lastName } : {
          type: MemberType.USER_PLACE,
          name: sharedLineMemeber.displayName };
    return this.$translate.instant('autoAnswerPanel.userSharedLineDescription', memberInfo);
  }

  private processAutoAnswerSelectionChange(autoAnswerChanges: ng.IChangesObject): void {
      let autoAnswerPhone: AutoAnswerPhone = _.find(this.phoneList, AutoAnswerConst.ENABLED);
      if (autoAnswerPhone) {
        this.autoAnswerEnabled = true;
        this.autoAnswerPhoneSelected = _.find(this.autoAnswerPhoneOptions, { value: autoAnswerPhone.uuid });
        this.autoAnswerMode = autoAnswerPhone.mode;
      } else {
        this.autoAnswerEnabled = false;
        this.autoAnswerMode = undefined;
        this.autoAnswerPhoneSelected = (this.phoneList.length === 1) ? this.autoAnswerPhoneOptions[0] : undefined ;
      }

      let member: AutoAnswerMember = autoAnswerChanges.currentValue.member;
      if (member && autoAnswerChanges.currentValue.enabledForSharedLineMember) {
        this.autoAnswerEnabledForSharedLineMemberMsg = this.getCustomSharedLineMemberWarningMsg(member);
      }
  }

  private change(uuid: string | undefined, enabled: boolean, mode: string | null | undefined): void {
    this.onChangeFn({
      phoneId: uuid,
      enabled: enabled,
      mode: mode,
    });
  }
}

export class AutoAnswerComponent implements ng.IComponentOptions {
  public controller = AutoAnswerCtrl;
  public templateUrl = 'modules/huron/autoAnswer/autoAnswer.html';
  public bindings = {
    autoAnswer: '<',
    onChangeFn: '&',
  };
}
