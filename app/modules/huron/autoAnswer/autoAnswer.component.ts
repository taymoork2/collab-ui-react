import { IOption } from 'modules/huron/dialing/dialing.service';
import { AutoAnswerMember, AutoAnswerPhone } from './autoAnswer';
import { AutoAnswerConst } from './autoAnswer.service';
import { MemberType } from 'modules/huron/members';
import { LineConsumerType } from 'modules/huron/lines/services/line.service';
import { MemberTypeConst } from 'modules/huron/features/services/featureMember.service';

export class AutoAnswerCtrl implements ng.IComponentController {
  public onChangeFn: Function;
  public autoAnswerNoSupportedPhone: boolean;
  public autoAnswerEnabledForSharedLineMemberMsg: string | undefined;

  public autoAnswerEnabled: boolean;
  public autoAnswerPhoneOptions: IOption[] | undefined;
  public autoAnswerPhoneSelected: IOption | undefined;
  public autoAnswerMode: string | null | undefined;

  /* @ngInject */
  constructor (
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.autoAnswerNoSupportedPhone = false;
    this.autoAnswerEnabled = false;
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { autoAnswer } = changes;
    if (autoAnswer) {
      this.processPhoneListChange(autoAnswer);

      if (!this.autoAnswerNoSupportedPhone) {
        this.processAutoAnswerSelectionChange(autoAnswer);
        this.setCustomSharedLineMemberWarningMsg(autoAnswer);
      }
    }
  }

  public onAutoAnswerOptionChange(): void {
    this.change(this.autoAnswerPhoneSelected!.value, this.autoAnswerEnabled, this.autoAnswerMode);
  }

  public onAutoAnswerToggleChange(value: boolean): void {
    let phoneId: string;
    if (value) {
      this.autoAnswerMode = AutoAnswerConst.SPEAKERPHONE;
      this.autoAnswerPhoneSelected = this.autoAnswerPhoneOptions![0] ;
      phoneId = this.autoAnswerPhoneSelected.value;
    } else {
      phoneId = this.autoAnswerPhoneSelected!.value;
    }
    this.change(phoneId, value, this.autoAnswerMode);
  }

  private processPhoneListChange(autoAnswerChanges: ng.IChangesObject<any>): void {
    if (_.isUndefined(autoAnswerChanges.currentValue) || _.isNull(autoAnswerChanges.currentValue)) {
      this.autoAnswerNoSupportedPhone = true;
      return;
    }

    const _phoneList: AutoAnswerPhone[] = autoAnswerChanges.currentValue.phones;
    if (_.isUndefined(_phoneList) || _.isNull(_phoneList) || _phoneList.length === 0) {
      this.autoAnswerNoSupportedPhone = true;
      return;
    }

    if (_.isUndefined(this.autoAnswerPhoneOptions)) {
      this.convertAutoAnswerPhonesToOptionsArray(_phoneList as AutoAnswerPhone[]);
    }
  }

  private convertAutoAnswerPhonesToOptionsArray(autoAnswerPhones: AutoAnswerPhone[]): void {
    this.autoAnswerPhoneOptions = _.map(autoAnswerPhones, (phone) => {
      return {
        label: phone.description,
        value: phone.uuid,
      };
    });
  }

  private setCustomSharedLineMemberWarningMsg(autoAnswerChanges: ng.IChangesObject<any>): void {
    if (_.isUndefined(this.autoAnswerEnabledForSharedLineMemberMsg)) {
      const member: AutoAnswerMember = autoAnswerChanges.currentValue.member;
      if (member && autoAnswerChanges.currentValue.enabledForSharedLineMember) {
        const _ownerType = (autoAnswerChanges.currentValue.ownerType === LineConsumerType.USERS) ? MemberType.USER_REAL_USER : MemberType.USER_PLACE;
        const _shareMemberType = (member.type === MemberTypeConst.USER) ? MemberType.USER_REAL_USER : MemberType.USER_PLACE;
        const _memberName = (member.type === MemberTypeConst.USER) ? (member.firstName + ' ' + member.lastName) : member.displayName;
        const _memberInfo = {
          ownerType: _ownerType,
          type: _shareMemberType,
          name: (_memberName && _.trim(_memberName)) ? _memberName : member.userName };
        this.autoAnswerEnabledForSharedLineMemberMsg = this.$translate.instant(
          'autoAnswerPanel.userSharedLineDescription', _memberInfo);
      } else {
        this.autoAnswerEnabledForSharedLineMemberMsg = '';
      }
    }
  }

  private processAutoAnswerSelectionChange(autoAnswerChanges: ng.IChangesObject<any>): void {
    if (autoAnswerChanges.currentValue && autoAnswerChanges.currentValue.phones) {
      const autoAnswerPhone: AutoAnswerPhone = _.find(autoAnswerChanges.currentValue.phones as AutoAnswerPhone[], AutoAnswerConst.ENABLED);
      if (autoAnswerPhone) {
        this.autoAnswerEnabled = true;
        this.autoAnswerPhoneSelected = _.find(this.autoAnswerPhoneOptions!, { value: autoAnswerPhone.uuid });
        this.autoAnswerMode = autoAnswerPhone.mode;
      } else {
        this.autoAnswerEnabled = false;
      }
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
  public template = require('modules/huron/autoAnswer/autoAnswer.html');
  public bindings = {
    autoAnswer: '<',
    onChangeFn: '&',
  };
}
