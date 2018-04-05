class BsftSiteNameCtrl implements ng.IComponentController {
  public name: string;
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

  public onNameChanged(): void {
    this.onChangeFn({
      name: this.name,
    });
  }
}

export class BsftSiteNameComponent implements ng.IComponentOptions {
  public controller = BsftSiteNameCtrl;
  public template = require('modules/call/bsft/settings/settings-site-name/settings-site-name.component.html');
  public bindings = {
    name: '<',
    onChangeFn: '&',
  };
}
