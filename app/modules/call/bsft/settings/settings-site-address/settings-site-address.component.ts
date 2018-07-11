class BsftSiteAddressCtrl implements ng.IComponentController {
  public address1: string;
  public address2: string;
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

  public onAddressChanged(): void {
    this.onChangeFn({
      address1: this.address1,
      address2: this.address2,
    });
  }
}

export class BsftSiteAddressComponent implements ng.IComponentOptions {
  public controller = BsftSiteAddressCtrl;
  public template = require('modules/call/bsft/settings/settings-site-address/settings-site-address.component.html');
  public bindings = {
    address1: '<',
    address2: '<',
    onChangeFn: '&',
  };
}
