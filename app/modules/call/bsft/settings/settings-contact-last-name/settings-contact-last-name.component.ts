class BsftContactLastNameCtrl implements ng.IComponentController {
  public lastName: string;
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
      lastName: this.lastName,
    });
  }
}

export class BsftContactLastNameComponent implements ng.IComponentOptions {
  public controller = BsftContactLastNameCtrl;
  public template = require('modules/call/bsft/settings/settings-contact-last-name/settings-contact-last-name.component.html');
  public bindings = {
    lastName: '<',
    onChangeFn: '&',
  };
}
