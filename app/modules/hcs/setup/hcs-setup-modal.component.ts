import { HcsSetupModalService, HcsUpgradeService } from 'modules/hcs/shared';
import { ICheckbox, ISoftwareProfile } from './hcs-setup';
import { ISftpServer } from './hcs-setup-sftp';
import { Notification } from 'modules/core/notifications';

export class HcsSetupModalCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 5;
  private static readonly FIRST_INDEX: number = 0;

  public currentStepIndex: number;
  public hcsServices: ICheckbox;
  public sftpServer: ISftpServer;
  public softwareProfile: ISoftwareProfile;
  public nextEnabled: boolean = false;
  public title: string;
  public hcsSetupModalForm: ng.IFormController;
  public cancelRemoved: boolean = false;
  public finish: boolean = false;
  public finishDisable: boolean = false;
  public isFirstTimeSetup: boolean;

  /* @ngInject */
  constructor(
    private HcsSetupModalService: HcsSetupModalService,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
  ) {
  }

  public $onInit(): void {
    if (_.isUndefined(this.currentStepIndex)) {
      this.currentStepIndex = HcsSetupModalCtrl.FIRST_INDEX;
    }
    this.nextStep();
  }

  public nextStep(): void {
    this.currentStepIndex = this.currentStepIndex + 1;
    switch (this.currentStepIndex) {
      case 1:
        this.hcsServices = { license: false, upgrade: false };
        this.title = 'hcs.setup.titleServices';
        if (this.hcsSetupModalForm) {
          this.hcsSetupModalForm.$setPristine();
        }
      case 2:
        this.title = 'hcs.installFiles.setupTitle';
        this.nextEnabled = false;
        if (!this.isFirstTimeSetup) {
          this.finish = true;
          this.finishDisable = true;
        }
        break;
      case 3:
        if (!this.hcsServices.upgrade) {
          this.title = 'hcs.setup.finish';
          this.cancelRemoved = true;
          this.finish = true;
        } else {
          this.title = 'hcs.sftp.setupTitle';
          this.nextEnabled = false;
        }
        break;
      case 4:
        if (!this.hcsServices.upgrade) {
          this.dismissModal();
        } else {
          this.createSftp();
          this.title = 'hcs.softwareProfiles.title';
          this.nextEnabled = false;
        }
        break;
      case HcsSetupModalCtrl.MAX_INDEX:
        this.cancelRemoved = true;
        this.finish = true;
        this.title = 'hcs.setup.finish';
        break;
      default:
        this.dismissModal();
    }
  }

  public createSftp(): void {
    this.HcsUpgradeService.createSftpServer(this.sftpServer)
      .then(() => this.Notification.success('hcs.sftp.success'))
      .catch(e => this.Notification.error(e, 'hcs.sftp.error'));
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
    if (!this.isFirstTimeSetup) {
      if (this.nextEnabled) {
        this.finishDisable = false;
      } else {
        this.finishDisable = true;
      }
    }
  }

  public setSftpServer(sftpServer: ISftpServer) {
    this.nextEnabled = (sftpServer && this.hcsSetupModalForm.$valid);
    this.sftpServer = sftpServer;
  }

  public setSoftwareProfile(profile: ISoftwareProfile) {
    this.nextEnabled = ( profile && this.hcsSetupModalForm.$valid);
    this.softwareProfile = profile;
  }

  public dismissModal(): void {
    this.HcsSetupModalService.dismissModal();
  }

  public finishFxn() {
    //save data here if needed or create a save fxn and call here and at the start of nextStep fxn to save previous step data
    this.dismissModal();
  }
}

export class HcsSetupModalComponent implements ng.IComponentOptions {
  public controller = HcsSetupModalCtrl;
  public template = require('modules/hcs/setup/hcs-setup-modal.component.html');
  public bindings = {
    isFirstTimeSetup: '<',
    currentStepIndex: '<',
  };
}
