class DialingSetupCtrl implements ng.IComponentController {
  public regionCode: string;
  public isTerminusCustomer: boolean;
  public onChangeFn: Function;
  public dialingHabit: string = 'national';
  public messages: any = {};

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
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { regionCode } = changes;

    if (regionCode && regionCode.currentValue) {
      this.processDialingHabitChanges(regionCode.currentValue);
    }
  }

  private processDialingHabitChanges(regionCode: string): void {
    if (_.isEmpty(regionCode)) {
      this.dialingHabit = 'national';
    } else {
      this.dialingHabit = 'local';
    }
  }

  public onDialingHabitChanged(): void {
    if (this.dialingHabit === 'national') {
      this.regionCode = '';
    }
    this.onRegionCodeChanged();
  }

  public onRegionCodeChanged() {
    this.onChangeFn({
      regionCode: this.regionCode,
    });
  }
}

export class DialingSetupComponent {
  public controller = DialingSetupCtrl;
  public templateUrl = 'modules/huron/settings/dialing/dialing.html';
  public bindings = {
    regionCode: '<',
    isTerminusCustomer: '<',
    onChangeFn: '&',
  };
}
