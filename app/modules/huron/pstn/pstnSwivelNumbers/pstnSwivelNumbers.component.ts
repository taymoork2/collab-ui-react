import { Notification } from 'modules/core/notifications';
import { TIMEOUT } from './index';
import { TokenMethods } from './tokenMethods';

declare var phoneUtils: any;

export class PstnSwivelNumbersComponent implements ng.IComponentOptions {
  public controller = PstnSwivelNumbersCtrl;
  public templateUrl = 'modules/huron/pstn/pstnSwivelNumbers/pstnSwivelNumbers.html';
  public bindings = {
    numbers: '<',
    acknowledge: '<',
    noAcknowledge: '@',
    onChange: '&',
    onAcknowledge: '&',
  };
}

export class PstnSwivelNumbersCtrl implements ng.IComponentController {
  public numbers: Array<any> = [];
  public onChange: Function;
  public onAcknowledge: Function;
  public tokenfieldid: string = 'swivelAddNumbersID';
  public tokenplaceholder: string;
  public tokenoptions: Object = {
    delimiter: [',', ';'],
    createTokensOnBlur: true,
    limit: 50,
    tokens: [],
    minLength: 9,
    beautify: false,
  };
  public tokenmethods: TokenMethods;
  public acknowledge: boolean;
  public invalidCount: number = 0;

  /* @ngInject */
  constructor(private $timeout: ng.ITimeoutService,
              private Notification: Notification,
              private TelephoneNumberService,
              private $translate: ng.translate.ITranslateService) {

    this.tokenplaceholder = this.$translate.instant('didManageModal.inputPlacehoder');
    this.tokenmethods = new TokenMethods(
      this.createToken.bind(this),
      this.createdToken.bind(this),
      this.editToken.bind(this),
      this.removeToken.bind(this),
    );
  }

  public $onChanges(changes): void {
    const { numbers } = changes;
    if (numbers && numbers.isFirstChange()) {
      this.$timeout(() => {
        this.setSwivelNumberTokens(numbers.currentValue);
      }, TIMEOUT);
    }
  }

  public createToken(e): void {
    if (e.attrs.value.charAt(0) !== '+') {
      e.attrs.value = '+'.concat(e.attrs.value);
    }
    try {
      e.attrs.value = e.attrs.label = phoneUtils.formatE164(e.attrs.value);
    } catch (e) {
      //noop
    }

    let duplicate = _.find(this.getSwivelNumberTokens(), {
      value: e.attrs.value,
    });
    if (duplicate) {
      e.attrs.duplicate = true;
    }
  }

  public createdToken(e): void {
    if (e.attrs.duplicate) {
      this.$timeout(() => {
        let tokens = this.getSwivelNumberTokens();
        tokens = tokens.splice(_.indexOf(tokens, e.attrs), 1);
        this.Notification.error('pstnSetup.duplicateNumber', {
          number: e.attrs.label,
        });
        this.setSwivelNumberTokens(tokens.map(function (token) {
          return token.value;
        }));
      });
    } else if (!this.TelephoneNumberService.internationalNumberValidator(e.attrs.value)) {
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
      invalidCount: this.invalidCount,
    });
  }

  public editToken(e): void {
    this.removeNumber(e.attrs.value);
    // If invalid token, show the label text in the edit input
    if (!this.TelephoneNumberService.internationalNumberValidator(e.attrs.value)) {
      e.attrs.value = e.attrs.label;
      this.invalidCount--;
    }
  }

  private setPlaceholderText(text): void {
    $('#' + this.tokenfieldid).attr('placeholder', text);
  }


  public onAckChange(): void {
    this.onAcknowledge({
      value: this.acknowledge,
    });
  }

  private removeToken(e): void {
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
    let index = _.indexOf(this.numbers, value);
    if (index > -1) {
      this.numbers.splice(index, 1);
    }
  }

  private getSwivelNumberTokens(): Array<{value, label}> {
    return angular.element('#' + this.tokenfieldid).tokenfield('getTokens');
  }

  private setSwivelNumberTokens(tokens): void {
    angular.element('#' + this.tokenfieldid).tokenfield('setTokens', tokens);
  }
}
