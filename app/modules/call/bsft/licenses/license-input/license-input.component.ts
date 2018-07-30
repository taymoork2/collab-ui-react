class LicenseInputCtrl implements ng.IComponentController {
  public availableLicenses: number;
  public totalLicenses: number;
  public onChangeFn: Function;
  public messages: any = {};
  public type: string;
  public title: string;
  public licenses: number;
  public availableLicensesCopy;
  public siteLicenses;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
      max: 'Exceeds the available licenses',
    };
  }

  public $onInit() {
    this.availableLicensesCopy = _.cloneDeep(this.availableLicenses);
    if (this.siteLicenses) {
      this.licenses = this.siteLicenses;
      this.onLicensesChanged();
    }
  }

  public onLicensesChanged(): void {
    this.availableLicensesCopy = this.availableLicenses - this.licenses;
    this.onChangeFn({
      licenses: this.licenses,
    });
  }
}

export class LicenseInputComponent implements ng.IComponentOptions {
  public controller = LicenseInputCtrl;
  public template = require('modules/call/bsft/licenses/license-input/license-input.component.html');
  public bindings = {
    availableLicenses: '<',
    totalLicenses: '<',
    title: '@',
    onChangeFn: '&',
    siteLicenses: '<',
  };
}
