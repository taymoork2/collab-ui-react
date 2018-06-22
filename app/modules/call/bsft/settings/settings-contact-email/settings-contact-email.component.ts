class BsftContactEmailCtrl implements ng.IComponentController {
  public email: string;
  public onChangeFn: Function;
  public messages: any = {};

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
      email: this.$translate.instant('common.invalidEmail'),
    };
  }

  public onEmailChanged(): void {
    this.onChangeFn({
      email: this.email,
    });
  }
}

export class BsftContactEmailComponent implements ng.IComponentOptions {
  public controller = BsftContactEmailCtrl;
  public template = require('modules/call/bsft/settings/settings-contact-email/settings-contact-email.component.html');
  public bindings = {
    email: '<',
    onChangeFn: '&',
  };
}
