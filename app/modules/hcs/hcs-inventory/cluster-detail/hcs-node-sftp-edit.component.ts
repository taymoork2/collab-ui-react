import { ISelectOption } from '../shared/hcs-inventory';
import { IHcsNode } from 'modules/hcs/hcs-shared/hcs-upgrade';

export class HcsNodeSftpEditComponent implements ng.IComponentOptions {
  public controller = HcsNodeSftpEditCtrl;
  public template = require('./hcs-node-sftp-edit.component.html');
  public bindings = {
    saveSftp: '&',
    dismiss: '&',
    node: '<',
    sftpLocations: '<',
  };
}

export class HcsNodeSftpEditCtrl implements ng.IComponentController {
  public dismiss: Function;
  public saveSftp: Function;
  public sftpLocationSelected: ISelectOption;
  public sftpLocations: ISelectOption[];
  public node: IHcsNode;
  public sftpSelectPlaceholder: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public cancel() {
    this.dismiss();
  }

  public $onInit() {
    if (this.node.sftpServer) {
      this.sftpLocationSelected = {
        label: this.node.sftpServer.name,
        value: this.node.sftpServer.sftpServerUuid,
      };
    } else {
      this.sftpLocationSelected = { label: '', value: '' };
    }
    this.sftpSelectPlaceholder = this.$translate.instant('hcs.clusterDetail.settings.sftpLocation.sftpPlaceholder');
  }

  public save() {
    this.saveSftp({
      node: this.node,
      sftp: this.sftpLocationSelected,
    });
    this.dismiss();
  }
}
