import { HcsUpgradeService } from 'modules/hcs/shared';
import { ISftpServer } from '../../setup/hcs-setup-sftp';
import { Notification } from 'modules/core/notifications';

export class HcsUpgradeSftpEditCtrl implements ng.IComponentController {

  public back: boolean = true;
  public backState: string = 'hcs.sftplist';
  public sftpServer: ISftpServer;
  public form: ng.IFormController;
  /* @ngInject */
  constructor(
    private HcsUpgradeService: HcsUpgradeService,
    private $state: ng.ui.IStateService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    if (this.form) {
      this.form.$setPristine();
    }
  }

  public saveSftpServer(): void {
    this.HcsUpgradeService.updateSftpServer(this.sftpServer.uuid, this.sftpServer)
    .then(() => {
      this.Notification.success('hcs.sftp.successUpdate');
    })
    .catch(e => {
      this.Notification.error(e.message, 'hcs.sftp.error');
    });
  }

  public setSftpServer(sftpServer: ISftpServer): void {
    this.sftpServer = sftpServer;
  }

  public cancel(): void {
    this.$state.go('hcs.sftplist');
  }
}

export class HcsUpgradeSftpEditComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeSftpEditCtrl;
  public template = require('./hcs-upgrade-sftp-edit.component.html');
  public bindings = {
    sftpServer: '<',
  };
}
