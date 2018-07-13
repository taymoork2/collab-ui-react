import { Notification } from 'modules/core/notifications';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { TokenMethods } from 'modules/call/bsft/numbers/token-methods';
import { EnumCountryCode } from 'modules/call/bsft/shared';

export class PortedNumbersAddComponentCtrl implements ng.IComponentController {
  public form: ng.IFormController;
  public numbers: any[] = [];
  public onChange: Function;
  public onAdd: Function;
  public tokenfieldid: string = 'TOKEN_FIELD_ID';
  public tokenplaceholder: string;
  private static readonly TIMEOUT: number = 100;
  private static readonly MINLENGTH: number = 10;
  private static readonly NUMBER_MAX_LIMIT: number = 4;
  private static readonly NUMBER_MIN_LIMIT: number = 2;
  public tokenoptions: Object = {
    delimiter: [','],
    createTokensOnBlur: true,
    tokens: [],
    minLength: 9,
    beautify: false,
  };
  public tokenmethods: TokenMethods;
  public invalidCount: number = 0;
  public isCiscoBsft: boolean = false;
  public portedTypeRadio: string = 'prev';
  public isBsftPorted: boolean = false;
  public portingNumbersCount: number = 0;
  /* @ngInject */
  constructor(private $timeout: ng.ITimeoutService,
              private Notification: Notification,
              private PhoneNumberService: PhoneNumberService,
              private $translate: ng.translate.ITranslateService,
              private Authinfo) {

    this.tokenplaceholder = this.$translate.instant('didManageModal.inputPlacehoder');
    this.tokenmethods = new TokenMethods(
      this.createToken.bind(this),
      this.createdToken.bind(this),
      this.editToken.bind(this),
      this.removeToken.bind(this),
    );
  }

  public $onInit() {
    const tokenfieldlimit: string = 'limit';
    this.isCiscoBsft = this.Authinfo.isBroadCloud();
    _.set(this.tokenoptions, tokenfieldlimit, PortedNumbersAddComponentCtrl.NUMBER_MAX_LIMIT);
    if (this.form) {
      this.form.$setValidity('', false, this.form);
    }
  }

  public $onChanges(changes): void {
    const { numbers } = changes;
    if (numbers) {
      this.$timeout(() => {
        this.setBsftPortedNumberTokens(numbers.currentValue);
      }, PortedNumbersAddComponentCtrl.TIMEOUT);
    }
  }

  public createToken(e): void {
    if (e.attrs.value.length === PortedNumbersAddComponentCtrl.MINLENGTH) {
      if (e.attrs.value.charAt(0) !== EnumCountryCode.US) {
        e.attrs.value = EnumCountryCode.US.concat(e.attrs.value);
      }
    }
    if (e.attrs.value.charAt(0) !== '+') {
      e.attrs.value = '+'.concat(e.attrs.value);
    }
    try {
      e.attrs.value = e.attrs.label = this.PhoneNumberService.getE164Format(e.attrs.value);
    } catch (e) {
      //noop
    }

    const duplicate = _.find(this.getBsftPortedNumberTokens(), {
      value: e.attrs.value,
    });
    if (duplicate) {
      e.attrs.duplicate = true;
    }
  }

  public createdToken(e): void {
    if (e.attrs.duplicate) {
      this.$timeout(() => {
        let tokens = this.getBsftPortedNumberTokens();
        tokens = tokens.splice(_.indexOf(tokens, e.attrs), 1);
        this.Notification.error('pstnSetup.duplicateNumber', {
          number: e.attrs.label,
        });
        this.setBsftPortedNumberTokens(tokens.map(function (token) {
          return token.value;
        }));
      });
    } else if (!this.PhoneNumberService.numberNANPValidator(e.attrs.value)) {
      angular.element(e.relatedTarget).addClass('invalid');
      e.attrs.invalid = true;
      this.invalidCount++;
    } else {
      if (this.numbers.indexOf(e.attrs.value) === -1) {
        this.numbers.push(e.attrs.value);
        this.portingNumbersCount++;
        this.validateForm();
      }
      this.setPlaceholderText('');
    }
    this.onChange({
      numbers: this.numbers,
      invalidCount: this.invalidCount,
    });
  }

  public editToken(e): void {
    this.removeNumber(e.attrs.value);
    // If invalid token, show the label text in the edit input
    if (!this.PhoneNumberService.numberNANPValidator(e.attrs.value)) {
      e.attrs.value = e.attrs.label;
      this.invalidCount--;
    }
  }

  private setPlaceholderText(text): void {
    $('#' + this.tokenfieldid).attr('placeholder', text);
  }

  private removeToken(e): void {
    this.portingNumbersCount--;
    this.removeNumber(e.attrs.value);
    if (angular.element(e.relatedTarget).hasClass('invalid')) {
      this.invalidCount--;
    }
    this.onChange({
      numbers: this.numbers,
      invalidCount: this.invalidCount,
    });
  }

  private removeNumber(value): void {
    const index = _.indexOf(this.numbers, value);
    if (index > -1) {
      this.numbers.splice(index, 1);
    }
    this.validateForm();
  }

  private getBsftPortedNumberTokens(): {value, label}[] {
    return (angular.element('#' + this.tokenfieldid) as any).tokenfield('getTokens');
  }

  private setBsftPortedNumberTokens(tokens): void {
    if (this.invalidCount || !this.validateForm()) {
      return;
    }
    (angular.element('#' + this.tokenfieldid) as any).tokenfield('setTokens', tokens);
  }

  public validateForm(): boolean {
    let isValid: boolean = true;
    if (this.form) {
      this.form.$setValidity('', true, this.form);
      if (this.invalidCount || this.portingNumbersCount < PortedNumbersAddComponentCtrl.NUMBER_MIN_LIMIT) {
        this.form.$setValidity('', false, this.form);
        isValid = false;
      }
      if (this.portingNumbersCount > PortedNumbersAddComponentCtrl.NUMBER_MAX_LIMIT
          ) {
        this.form.$setValidity('', false, this.form);
        this.Notification.error('broadCloud.numbers.maxlimit', {
          max: PortedNumbersAddComponentCtrl.NUMBER_MAX_LIMIT,
          min: PortedNumbersAddComponentCtrl.NUMBER_MIN_LIMIT,
        });
        isValid = false;
      }
    }
    return isValid;
  }

  public setPortingNumberType(type: string): void {
    this.isBsftPorted = type === 'bsft' ? true : false;
  }

  public addNumbers(): void {
    this.onAdd({
      numbers: this.numbers,
      isBsftPorted: this.isBsftPorted,
    });
    this.clear();
  }

  public clear(): void {
    this.numbers.splice(0, this.numbers.length);
    this.setBsftPortedNumberTokens(',');
  }
}

export class PortedNumbersAddComponent implements ng.IComponentOptions {
  public controller = PortedNumbersAddComponentCtrl;
  public template = require('modules/call/bsft/numbers/ported-number-add/ported-numbers-add.component.html');
  public bindings = {
    numbers: '<',
    onChange: '&',
    onAdd: '&',
  };
}
