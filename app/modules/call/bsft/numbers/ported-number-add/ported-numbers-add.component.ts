import { Notification } from 'modules/core/notifications';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { EnumCountryCode } from 'modules/call/bsft/shared';

export class PortedNumbersAddComponentCtrl implements ng.IComponentController {
  public form: ng.IFormController;
  public textForm: ng.IFormController;
  public numbers: any[] = [];
  public texttoken: string;
  public onAdd: Function;
  private static readonly MINLENGTH: number = 10;
  public static readonly NUMBER_MAX_LIMIT: number = 5;
  private static readonly NUMBER_MIN_LIMIT: number = 2;

  public isInvalid: boolean = false;
  public isCiscoBsft: boolean = false;
  public portedTypeRadio: string = 'prev';
  public isBsftPorted: boolean = false;
  public portingNumbersCount: number = 0;
  public tokenplaceholder: string;
  public totalNumbers: string[] = [];
  /* @ngInject */
  constructor(
              private Notification: Notification,
              private PhoneNumberService: PhoneNumberService,
              private $translate: ng.translate.ITranslateService,
              private Authinfo) {

    this.tokenplaceholder = this.$translate.instant('didManageModal.inputPlacehoder');
  }

  public $onInit() {
    this.isCiscoBsft = this.Authinfo.isBroadCloud();
    if (this.form) {
      this.form.$setValidity('', false, this.form);
    }
    this.totalNumbers = [];
  }

  public setPortingNumberType(type: string): void {
    this.isBsftPorted = type === 'bsft' ? true : false;
  }

  public $onChanges(changes): void {
    const { totalNumbers } = changes;
    if (!_.isUndefined(totalNumbers) && totalNumbers.currentValue) {
      this.totalNumbers = _.clone(totalNumbers.currentValue);
      this.isInvalid = this.totalNumbers.length >= PortedNumbersAddComponentCtrl.NUMBER_MAX_LIMIT;
      this.portingNumbersCount = this.totalNumbers.length ;
      this.validateForm();
    }
  }

  public validateTokens() {
    this.isInvalid = false;
    this.numbers = _.split(this.texttoken, ',');
    const validnumbers: string[] = [];
    this.texttoken = '';
    this.portingNumbersCount = (this.totalNumbers) ? this.totalNumbers.length : 0;
    _.forEach (this.numbers, num => {
      num = _.trim(num);
      if (num) {
        if (num.length === PortedNumbersAddComponentCtrl.MINLENGTH) {
          if (num.charAt(0) !== EnumCountryCode.US) {
            num = EnumCountryCode.US.concat(num);
          }
        }
        if (num.length > PortedNumbersAddComponentCtrl.MINLENGTH && num.charAt(0) !== '+') {
          num = '+'.concat(num);
        }
        if (!_.isEmpty(this.texttoken)) {
          this.texttoken = this.texttoken + ',';
        }
        if (!this.PhoneNumberService.numberNANPValidator(num)) {
          this.texttoken = this.texttoken + num;
          this.textForm.numberPorting.$setValidity('invalid', false);
        } else {

          if (this.portingNumbersCount < PortedNumbersAddComponentCtrl.NUMBER_MAX_LIMIT) {
            if (_.indexOf(this.totalNumbers, num) !== -1 || _.indexOf(validnumbers, num) !== -1) {
              this.texttoken = this.texttoken + num;
              this.textForm.numberPorting.$setValidity('duplicate', false);
            } else {
              this.portingNumbersCount++;
              validnumbers.push(num);
            }
          } else {
            this.isInvalid = true;
            this.texttoken = this.texttoken + num;
          }
        }
      }
    });
    this.validateForm();
    this.form.$setValidity('', false, this.form);

    this.numbers = _.uniq(validnumbers);
    if (this.numbers.length !== validnumbers.length) {
      this.textForm.numberPorting.$setValidity('duplicate', false);
    }
  }

  public validateForm() {
    if (this.portingNumbersCount > PortedNumbersAddComponentCtrl.NUMBER_MAX_LIMIT) {
      this.textForm.numberPorting.$setValidity('maxlimit', false);
      this.Notification.error('broadCloud.numbers.maxlimit', {
        max: PortedNumbersAddComponentCtrl.NUMBER_MAX_LIMIT,
        min: PortedNumbersAddComponentCtrl.NUMBER_MIN_LIMIT,
      });
    }
    if (this.portingNumbersCount < PortedNumbersAddComponentCtrl.NUMBER_MIN_LIMIT) {
      this.textForm.numberPorting.$setValidity('minlimit', false);
      this.form.$setValidity('', false, this.form);
    } else {
      this.form.$setValidity('', true, this.form);
    }
  }

  public resetErrors(): void {
    this.textForm.numberPorting.$setValidity('invalid', true);
    this.textForm.numberPorting.$setValidity('duplicate', true);
    this.textForm.numberPorting.$setValidity('maxlimit', true);
    this.textForm.numberPorting.$setValidity('minlimit', true);
  }

  public onChange(): void {
    this.resetErrors();
  }

  public addNumbers(): void {
    this.validateTokens();
    this.onAdd({
      numbers: this.numbers,
      isBsftPorted: this.isBsftPorted,
    });
  }

  public clear(): void {
    this.numbers.splice(0, this.numbers.length);
    this.texttoken = '';
    this.resetErrors();
  }
}

export class PortedNumbersAddComponent implements ng.IComponentOptions {
  public controller = PortedNumbersAddComponentCtrl;
  public template = require('modules/call/bsft/numbers/ported-number-add/ported-numbers-add.component.html');
  public bindings = {
    numbers: '<',
    totalNumbers: '<',
    onAdd: '&',
  };
}
