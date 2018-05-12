import { ISelectOption } from '../shared/hcs-inventory';
import { IHcsNode, ISftpServerItem } from 'modules/hcs/hcs-shared/hcs-upgrade';
import { HcsUpgradeService } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';

export class HcsNodeSftpEditComponent implements ng.IComponentOptions {
  public controller = HcsNodeSftpEditCtrl;
  public template = require('./hcs-node-sftp-edit.component.html');
  public bindings = {
    refreshData: '&',
    dismiss: '&',
    node: '<',
    sftpServers: '<',
  };
}

export class HcsNodeSftpEditCtrl implements ng.IComponentController {
  public dismiss: Function;
  public refreshData: Function;
  public sftpServerSelected: ISelectOption;
  public sftpServers: ISelectOption[];
  public node: IHcsNode;
  public sftpSelectPlaceholder: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
  ) {}

  public cancel() {
    this.dismiss();
  }

  public $onInit() {
    if (this.node.sftpServer) {
      this.sftpServerSelected = {
        label: this.node.sftpServer.name,
        value: this.node.sftpServer.sftpServerUuid,
      };
    } else {
      this.sftpServerSelected = { label: '', value: '' };
    }
    this.sftpSelectPlaceholder = this.$translate.instant('hcs.clusterDetail.settings.sftpLocation.sftpPlaceholder');
  }

  public save() {
    const sftpServer: ISftpServerItem = {
      sftpServerUuid: this.sftpServerSelected.value,
      name: this.sftpServerSelected.label,
    };
    this.HcsUpgradeService.updateNodeSftp(this.node.uuid, sftpServer)
      .then(() => {
        this.refreshData();
        this.dismiss();
      })
      .catch((err) => {
        this.Notification.error(err);
      });
  }
}
