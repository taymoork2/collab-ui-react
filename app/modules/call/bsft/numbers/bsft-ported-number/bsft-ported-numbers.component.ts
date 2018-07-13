import { Notification } from 'modules/core/notifications';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { TokenMethods } from 'modules/call/bsft/numbers/token-methods';

export class BsftPortedNumbersComponentCtrl implements ng.IComponentController {
  public form: ng.IFormController;
  public numbers: any[] = [];
  public onChange: Function;
  public tokenfieldid: string = 'TOKEN_FIELD_BSFT_ID';
  public tokenplaceholder: string;
  private static readonly TIMEOUT: number = 100;
  public tokenoptions: Object = {
    delimiter: [',', ';'],
    createTokensOnBlur: true,
    tokens: [],
    minLength: 9,
    beautify: false,
  };
  public tokenmethods: TokenMethods;
  public invalidCount: number = 0;
  public isCiscoBsft: boolean = false;

  /* @ngInject */
  constructor(private $timeout: ng.ITimeoutService,
              private Notification: Notification,
              private PhoneNumberService: PhoneNumberService,
              private Authinfo) {

    this.tokenplaceholder = '';
    this.tokenmethods = new TokenMethods(
      this.createToken.bind(this),
      this.createdToken.bind(this),
      this.editToken.bind(this),
      this.removeToken.bind(this),
    );
  }

  public $onInit() {
    const tokenfieldlimit: string = 'limit';
    const maxNumberOfTokens: number = 25;
    this.isCiscoBsft = this.Authinfo.isBroadCloud();
    _.set(this.tokenoptions, tokenfieldlimit, maxNumberOfTokens);
  }

  public $onChanges(changes): void {
    const { numbers } = changes;
    if (numbers) {
      this.$timeout(() => {
        this.numbers = numbers.currentValue;
        this.setBsftPortedNumberTokens(numbers.currentValue);
      }, BsftPortedNumbersComponentCtrl.TIMEOUT);
    }
  }

  public createToken(e): void {
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
      }
      this.setPlaceholderText('');
    }
    this.onChange({
      numbers: this.numbers,
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
    this.removeNumber(e.attrs.value);
    if (angular.element(e.relatedTarget).hasClass('invalid')) {
      this.invalidCount--;
    }
    this.onChange({
      numbers: this.numbers,
    });
  }

  private removeNumber(value): void {
    const index = _.indexOf(this.numbers, value);
    if (index > -1) {
      this.numbers.splice(index, 1);
    }
  }

  private getBsftPortedNumberTokens(): {value, label}[] {
    return (angular.element('#' + this.tokenfieldid) as any).tokenfield('getTokens');
  }

  private setBsftPortedNumberTokens(tokens): void {
    (angular.element('#' + this.tokenfieldid) as any).tokenfield('setTokens', tokens);
  }
}

export class BsftPortedNumbersComponent implements ng.IComponentOptions {
  public controller = BsftPortedNumbersComponentCtrl;
  public template = require('modules/call/bsft/numbers/bsft-ported-number/bsft-ported-numbers.component.html');
  public bindings = {
    numbers: '<',
    onChange: '&',
  };
}
