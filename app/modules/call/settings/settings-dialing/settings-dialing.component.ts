const exampleDialingStringBase = '555-1212';
const exampleDialingStringWithAreaCode = '972-' + exampleDialingStringBase;
const exampleDialingStringWithOne = '1-' + exampleDialingStringWithAreaCode;

class DialingSetupCtrl implements ng.IComponentController {
  public steeringDigit: string;
  public regionCode: string;
  public useSimplifiedNationalDialing: boolean;
  public supportsLocalDialing: boolean;
  public supportsSimplifiedNationalDialing: boolean;
  public isTerminusCustomer: boolean;
  public onChangeFn: Function;
  public dialingHabit: string = 'national';
  public messages: any = {};

  public exampleDialingString: string = '';
  public exampleDialingWithOneString: string = '';
  public exampleDialingBaseString: string = '';

  /* @ngInject */
  constructor (
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      areaCode: this.$translate.instant('validation.areaCode'),
      required: this.$translate.instant('validation.required'),
      pattern: this.$translate.instant('validation.numeric'),
    };
  }

  public $onInit(): void {
    this.processDialingHabitChanges(this.regionCode);
    this.exampleDialingBaseString = this.$translate.instant('serviceSetupModal.exampleDialing', { dialingExample: exampleDialingStringBase });
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      regionCode,
      steeringDigit,
      useSimplifiedNationalDialing,
    } = changes;

    if (regionCode && regionCode.currentValue) {
      this.processDialingHabitChanges(regionCode.currentValue);
    }

    if (steeringDigit && steeringDigit.currentValue) {
      this.exampleDialingString = this.getExampleDialingString();
      this.exampleDialingWithOneString = this.getExampleDialingWithOneString();
    }

    if (useSimplifiedNationalDialing && useSimplifiedNationalDialing.currentValue) {
      this.dialingHabit = 'national';
    }
  }

  private processDialingHabitChanges(regionCode: string): void {
    if (_.isEmpty(regionCode)) {
      this.dialingHabit = 'national';
    } else {
      this.dialingHabit = 'local';
      this.useSimplifiedNationalDialing = false;
    }
  }

  public onDialingHabitChanged(): void {
    if (this.dialingHabit === 'national') {
      this.regionCode = '';
    } else {
      this.useSimplifiedNationalDialing = false;
    }
    this.onRegionCodeChanged();
  }

  public onRegionCodeChanged(): void {
    this.onChangeFn({
      regionCode: this.regionCode,
      useSimplifiedNationalDialing: this.useSimplifiedNationalDialing,
    });
  }

  private getExampleDialingString(): string {
    let dialString;
    if (!_.isEqual(this.steeringDigit, 'null')) {
      dialString = this.steeringDigit + '-' + exampleDialingStringWithAreaCode;
    } else {
      dialString = exampleDialingStringWithAreaCode;
    }
    return this.$translate.instant('serviceSetupModal.exampleDialing', { dialingExample: dialString });
  }

  private getExampleDialingWithOneString(): string {
    let dialString;
    if (!_.isEqual(this.steeringDigit, 'null')) {
      dialString = this.steeringDigit + '-' + exampleDialingStringWithOne;
    } else {
      dialString = exampleDialingStringWithOne;
    }
    return this.$translate.instant('serviceSetupModal.exampleDialing', { dialingExample: dialString });
  }
}

export class DialingSetupComponent {
  public controller = DialingSetupCtrl;
  public template = require('modules/call/settings/settings-dialing/settings-dialing.component.html');
  public bindings = {
    steeringDigit: '<',
    useSimplifiedNationalDialing: '<',
    supportsLocalDialing: '<',
    supportsSimplifiedNationalDialing: '<',
    regionCode: '<',
    isTerminusCustomer: '<',
    onChangeFn: '&',
  };
}
