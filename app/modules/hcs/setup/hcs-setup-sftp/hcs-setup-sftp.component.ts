import { ISftpServer } from './hcs-setup-sftp';

export class HcsSetupSftpController implements ng.IComponentController {
  public readonly MAX_LENGTH: number = 255;
  public readonly MAX_LENGTH_NAME: number = 50;
  public onChangeFn: Function;
  public sftpServer: ISftpServer;
  public confirmPasswd: string;
  public messages: Object;
  public validators: Object;
  public errors: Object;
  // private passwdValid: boolean = false;
  public hcsSftpForm: ng.IFormController;
  /* @ngInject */
  constructor(
    public $translate,
  ) {
  }
  public $onInit() {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
      passwdMismatch: this.$translate.instant('hcs.sftp.passwordMismatch'),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH,
      }),
    };
    this.validators = {
      passwdMismatch: (viewValue: string) => this.confirmPassword(viewValue),
    };
    this.errors = {
      required: this.$translate.instant('common.invalidRequired'),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH_NAME,
      }),
    };
    if (this.hcsSftpForm) {
      this.hcsSftpForm.$setPristine();
    }
  }

  public changePassword() {
    if (this.confirmPasswd) {
      this.confirmPasswd = '';
    }
  }

  public confirmPassword(passwd): boolean {
    return (passwd && passwd === this.sftpServer.password);
  }

  public processChange() {
    this.onChangeFn({
      sftpServer: this.sftpServer,
    });
  }

}

export class HcsSetupSftpComponent implements ng.IComponentOptions {
  public controller = HcsSetupSftpController;
  public template = require('modules/hcs/setup/hcs-setup-sftp/hcs-setup-sftp.component.html');
  public bindings = {
    onChangeFn: '&',
  };
}
