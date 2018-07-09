class BsftSiteCountryCtrl implements ng.IComponentController {
  public country;
  public onChangeFn: Function;
  public messages: any = {};
  public countryList = [{
    name: 'United States',
    abbreviation: 'us',
  }];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
  }

  public onCountryChanged(): void {
    this.onChangeFn({
      country: this.country,
    });
  }
}

export class BsftSiteCountryComponent implements ng.IComponentOptions {
  public controller = BsftSiteCountryCtrl;
  public template = require('modules/call/bsft/settings/settings-site-country/settings-site-country.component.html');
  public bindings = {
    country: '<',
    onChangeFn: '&',
  };
}
