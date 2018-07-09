class BsftContactFirstNameCtrl implements ng.IComponentController {
  public firstName: string;
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
      firstName: this.firstName,
    });
  }
}

export class BsftContactFirstNameComponent implements ng.IComponentOptions {
  public controller = BsftContactFirstNameCtrl;
  public template = require('modules/call/bsft/settings/settings-contact-first-name/settings-contact-first-name.component.html');
  public bindings = {
    firstName: '<',
    onChangeFn: '&',
  };
}
