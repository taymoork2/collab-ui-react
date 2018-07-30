class BsftSiteZipcodeCtrl implements ng.IComponentController {
  public zipcode;
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

  public onZipcodeChanged(): void {
    this.onChangeFn({
      zipcode: this.zipcode,
    });
  }
}

export class BsftSiteZipcodeComponent implements ng.IComponentOptions {
  public controller = BsftSiteZipcodeCtrl;
  public template = require('modules/call/bsft/settings/settings-site-zipcode/settings-site-zipcode.component.html');
  public bindings = {
    zipcode: '<',
    onChangeFn: '&',
  };
}
