class BsftContactPhoneNumberCtrl implements ng.IComponentController {
  public phoneNumber: string;
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
      phone: this.phoneNumber,
    });
  }
}

export class BsftContactPhoneNumberComponent implements ng.IComponentOptions {
  public controller = BsftContactPhoneNumberCtrl;
  public template = require('modules/call/bsft/settings/settings-contact-phone-number/settings-contact-phone-number.component.html');
  public bindings = {
    phoneNumber: '<',
    onChangeFn: '&',
  };
}
