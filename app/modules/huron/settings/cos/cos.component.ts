class ClassOfService implements ng.IComponentController {
  public cosRestrictions;
  public premiumNumbers;
  private NATIONAL_CALLS = 'DIALINGCOSTAG_NATIONAL';
  private INTERNATIONAL_CALLS = 'DIALINGCOSTAG_INTERNATIONAL';
  private MOBILE_CALLS = 'DIALINGCOSTAG_MOBILE';
  private PREMIUM_CALLS = 'DIALINGCOSTAG_PREMIUM';
  public onChangeFn: Function;

  /* @ngInject */
  constructor() {}

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
    let indexnumber = _.findIndex(this.cosRestrictions, restriction => {
      return _.get(restriction, 'restriction', '') === value.restriction;
    });

    let clone = _.cloneDeep(this.cosRestrictions);
    clone.splice(indexnumber, 1, value);

    this.onChangeFn({
      restrictions: clone,
    });
  }
}

export class ClassOfServiceComponent implements ng.IComponentOptions {
  public controller = ClassOfService;
  public templateUrl = 'modules/huron/settings/cos/cos.component.html';
  public bindings = {
    env: '@',
    onChangeFn: '&',
    cosRestrictions: '<',
    premiumNumbers: '<',
  };
}
