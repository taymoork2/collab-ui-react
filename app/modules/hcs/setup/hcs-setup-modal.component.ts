import { HcsSetupModalService } from 'modules/hcs/services';
import { ICheckbox } from './hcs-setup';
import { ISftpServer } from './hcs-setup-sftp';

export class HcsSetupModalCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 3;
  private static readonly FIRST_INDEX: number = 1;

  public currentStepIndex: number;
  public hcsServices: ICheckbox;
  public sftpServer: ISftpServer;
  public nextEnabled: boolean = false;
  public title: string;
  public hcsSetupModalForm: ng.IFormController;
  /* @ngInject */
  constructor(
    public HcsSetupModalService: HcsSetupModalService,
  ) {
  }

  public $onInit(): void {
    if (_.isUndefined(this.currentStepIndex)) {
      this.currentStepIndex = HcsSetupModalCtrl.FIRST_INDEX;
    }
    this.hcsServices = { license: false, upgrade: false };
    this.title = 'hcs.setup.titleServices';
    if (this.hcsSetupModalForm) {
      this.hcsSetupModalForm.$setPristine();
    }
  }

  public nextStep(): void {
    this.currentStepIndex = this.currentStepIndex + 1;
    switch (this.currentStepIndex) {
      case 2:
        this.title = 'hcs.installFiles.setupTitle';
        this.nextEnabled = false;
        break;
      case 3:
        this.title = 'hcs.sftp.title';
        this.nextEnabled = false;
        break;
      case HcsSetupModalCtrl.MAX_INDEX:
        break;
      default:
        this.nextEnabled = false;
    }
  }

  public disableNext(): boolean  {
    return !this.nextEnabled;
  }

  public selectHcsService(selected: ICheckbox): void {
    this.nextEnabled = (selected.license || selected.upgrade);
    this.hcsServices = selected;
  }

  public setAgentInstallFile(fileName: string, httpProxyList: string[]): void {
    this.nextEnabled = !_.isEmpty(fileName) && !_.isUndefined(httpProxyList) && httpProxyList.length > 0;
    //to-do
  }

  public setSftpServer(sftpServer: ISftpServer) {
    this.nextEnabled = (sftpServer && this.hcsSetupModalForm.$valid);
    this.sftpServer = sftpServer;
  }

  public dismissModal(): void {
    this.HcsSetupModalService.dismissModal();
  }
}

export class HcsSetupModalComponent implements ng.IComponentOptions {
  public controller = HcsSetupModalCtrl;
  public template = require('modules/hcs/setup/hcs-setup-modal.component.html');
}
