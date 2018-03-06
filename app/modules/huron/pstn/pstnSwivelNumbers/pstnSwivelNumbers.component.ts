import { Notification } from 'modules/core/notifications';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { TIMEOUT } from './index';
import { TokenMethods } from './tokenMethods';

export class PstnSwivelNumbersComponent implements ng.IComponentOptions {
  public controller = PstnSwivelNumbersCtrl;
  public template = require('modules/huron/pstn/pstnSwivelNumbers/pstnSwivelNumbers.html');
  public bindings = {
    numbers: '<',
    acknowledge: '<',
    noAcknowledge: '@',
    onChange: '&',
    onAcknowledge: '&',
  };
}

export class PstnSwivelNumbersCtrl implements ng.IComponentController {
  public numbers: any[] = [];
  public onChange: Function;
  public onAcknowledge: Function;
  public tokenfieldid: string = 'swivelAddNumbersID';
  public tokenplaceholder: string;
  public tokenoptions: Object = {
    delimiter: [',', ';'],
    createTokensOnBlur: true,
    tokens: [],
    minLength: 9,
    beautify: false,
  };
  public tokenmethods: TokenMethods;
  public acknowledge: boolean;
  public invalidCount: number = 0;
  public i387FeatureToggle: boolean;

  /* @ngInject */
  constructor(private $timeout: ng.ITimeoutService,
              private Notification: Notification,
              private PhoneNumberService: PhoneNumberService,
              private $translate: ng.translate.ITranslateService,
              private FeatureToggleService) {

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
    const maxNumberOfByopTokens: number = 250;
    const maxNumberOfTokens: number = 50;

    this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking)
      .then((supported) => {
        const numberOfTokens = supported ? maxNumberOfByopTokens : maxNumberOfTokens;
        _.set(this.tokenoptions, tokenfieldlimit, numberOfTokens);
        this.i387FeatureToggle = supported;
      });
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
      e.attrs.value = e.attrs.label = this.PhoneNumberService.getE164Format(e.attrs.value);
    } catch (e) {
      //noop
    }

    const duplicate = _.find(this.getSwivelNumberTokens(), {
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
    const index = _.indexOf(this.numbers, value);
    if (index > -1) {
      this.numbers.splice(index, 1);
    }
  }

  private getSwivelNumberTokens(): {value, label}[] {
    return (angular.element('#' + this.tokenfieldid) as any).tokenfield('getTokens');
  }

  private setSwivelNumberTokens(tokens): void {
    (angular.element('#' + this.tokenfieldid) as any).tokenfield('setTokens', tokens);
  }
}
