import { ISelectOption } from '../shared/hcs-inventory';

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
  public node;

  /* @ngInject */
  constructor() {}

  public cancel() {
    this.dismiss();
  }

  public $onInit() {
    this.sftpLocationSelected = {
      label: this.node.sftpLocation,
      value: this.node.sftpLocation,
    };
  }

  public save() {
    this.saveSftp({
      node: this.node,
      sftp: this.sftpLocationSelected,
    });
    this.dismiss();
  }
}
