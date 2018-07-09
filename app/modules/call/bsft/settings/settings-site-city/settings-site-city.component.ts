class BsftSiteCityCtrl implements ng.IComponentController {
  public city: string;
  public onChangeFn: Function;
  public messages: any = {};

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
  }

  public onCityChanged(): void {
    this.onChangeFn({
      city: this.city,
    });
  }
}

export class BsftSiteCityComponent implements ng.IComponentOptions {
  public controller = BsftSiteCityCtrl;
  public template = require('modules/call/bsft/settings/settings-site-city/settings-site-city.component.html');
  public bindings = {
    city: '<',
    onChangeFn: '&',
  };
}
