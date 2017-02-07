class ClassOfService implements ng.IComponentController {

  private inputModel;
  private cosRestrictions;
  private NATIONAL_CALLS = 'DIALINGCOSTAG_NATIONAL';
  private INTERNATIONAL_CALLS = 'DIALINGCOSTAG_INTERNATIONAL';
  private MOBILE_CALLS = 'DIALINGCOSTAG_MOBILE';
  private PREMIUM_CALLS = 'DIALINGCOSTAG_PREMIUM';
  public onChangeFn: Function;

  /* @ngInject */
  constructor() {}

  public $onInit() {
    this.cosRestrictions = this.inputModel;
  }

  public $onChanges(changes): void {
    this.cosRestrictions = _.get(changes['inputModel'], 'currentValue');
  }

  public getTitle(restriction): string {
    switch (restriction) {
      case this.NATIONAL_CALLS:
        return 'serviceSetupModal.cos.nationalTitle';
      case this.INTERNATIONAL_CALLS:
        return 'serviceSetupModal.cos.internationalTitle';
      case this.MOBILE_CALLS:
        return 'serviceSetupModal.cos.mobileTitle';
      case this.PREMIUM_CALLS:
        return 'serviceSetupModal.cos.premiumTitle';
      default:
        return restriction;
    }
  }

  public getDescription(restriction): string {
    switch (restriction) {
      case this.NATIONAL_CALLS:
        return 'serviceSetupModal.cos.nationalDesc';
      case this.INTERNATIONAL_CALLS:
        return 'serviceSetupModal.cos.internationalDesc';
      case this.MOBILE_CALLS:
        return 'serviceSetupModal.cos.mobileDesc';
      case this.PREMIUM_CALLS:
        return 'serviceSetupModal.cos.premiumDesc';
      default:
        return restriction;
    }
  }

  public onChange(value): void {
    let indexnumber = _.findIndex(this.cosRestrictions, function(restriction) {
      return _.get(restriction, 'restriction', '') === value.restriction;
    });

    this.cosRestrictions.splice(indexnumber, 1, value);

    this.onChangeFn({
      restrictions: this.cosRestrictions,
    });
  }
}

export class ClassOfServiceComponent implements ng.IComponentOptions {
  public controller = ClassOfService;
  public templateUrl = 'modules/huron/cos/cos.component.html';
  public bindings = {
    env: '@',
    onChangeFn: '&',
    inputModel: '<',
  };
}
