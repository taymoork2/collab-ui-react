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
  public loading: boolean = false;
  public isSftp: boolean = true;

  /* @ngInject */
  constructor(
    private HcsSetupModalService: HcsSetupModalService,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
    private $state: ng.ui.IStateService,
  ) {
  }

  public $onInit(): void {
    if (_.isUndefined(this.currentStepIndex)) {
      this.currentStepIndex = HcsSetupModalCtrl.FIRST_INDEX;
    }
    this.initModalInfo();
  }

  public initModalInfo() {
    this.currentStepIndex = this.currentStepIndex + 1;
    this.loading = false;
    this.finishDisable = true;
    this.isSftp = false;
    if (!this.isFirstTimeSetup) {
      this.finish = true;
      this.finishDisable = true;
      this.isSftp = this.currentStepIndex === 3;
    }
    switch (this.currentStepIndex) {
      case 1:
        this.title = 'hcs.setup.titleServices';
        break;
      case 2:
        this.title = 'hcs.installFiles.setupTitle';
        break;
      case 3:
        this.isSftp = true;
        this.title = 'hcs.sftp.setupTitle';
        break;
      case 4:
        this.title = 'hcs.softwareProfiles.title';
        break;
      default:
        this.dismissModal();
    }
  }

  public nextStep(): void {
    this.currentStepIndex = this.currentStepIndex + 1;
    this.nextEnabled = false;
    switch (this.currentStepIndex) {
      case 1:
        this.hcsServices = { license: false, upgrade: false };
        if (this.hcsSetupModalForm) {
          this.hcsSetupModalForm.$setPristine();
        }
        break;
      case 2:
        this.nextEnabled = false;
        break;
      case 3:
        if (!this.hcsServices.upgrade) {
          this.title = 'hcs.setup.finish';
          this.cancelRemoved = true;
          this.finish = true;
          this.finishDisable = false;
        } else {
          this.title = 'hcs.sftp.setupTitle';
          this.nextEnabled = false;
        }
        break;
      case 4:
        if (!this.hcsServices.upgrade) {
          this.dismissModal();
        } else {
          this.loading = true;
          this.createSftp();
          this.title = 'hcs.softwareProfiles.title';
          this.nextEnabled = false;
        }
        break;
      case HcsSetupModalCtrl.MAX_INDEX:
        this.cancelRemoved = true;
        this.finish = true;
        this.finishDisable = false;
        this.title = 'hcs.setup.finish';
        break;
      default:
        this.dismissModal();
    }
  }

  public createSftp(): void {
    this.HcsUpgradeService.createSftpServer(this.sftpServer)
      .then(() => {
        this.Notification.success('hcs.sftp.success');
        this.loading = false;
        if (!this.isFirstTimeSetup) {
          this.$state.go(this.$state.current, {}, {
            reload: true,
          });
          this.dismissModal();
        }
      })
      .catch(e => {
        this.Notification.error(e, 'hcs.sftp.error');
        this.loading = false;
        if (!this.isFirstTimeSetup) {
          this.dismissModal();
        }
      });
  }

  public createInstallFile(): void {} //To-do

  public createSoftwareProfile(): void {} //To-do

  public disableNext(): boolean  {
    return !this.nextEnabled;
  }

  public selectHcsService(selected: ICheckbox): void {
    this.nextEnabled = (selected.license || selected.upgrade);
    this.hcsServices = selected;
  }

  public setAgentInstallFile(fileName: string, httpProxyList: string[]): void {
    this.nextEnabled = !_.isEmpty(fileName) && !_.isUndefined(httpProxyList) && httpProxyList.length > 0;
    this.enableSave();
  }

  public setSftpServer(sftpServer: ISftpServer) {
    this.nextEnabled = (sftpServer && this.hcsSetupModalForm.$valid);
    this.sftpServer = sftpServer;
    this.enableSave();
  }

  public enableSave() {
    if (!this.isFirstTimeSetup) {
      this.finishDisable = !this.nextEnabled;
    }
  }

  public setSoftwareProfile(profile: ISoftwareProfile) {
    this.nextEnabled = ( profile && this.hcsSetupModalForm.$valid);
    this.softwareProfile = profile;
  }

  public dismissModal(): void {
    this.HcsSetupModalService.dismissModal();
  }

  public finishModal(): void {
    if (this.isFirstTimeSetup) {
      this.dismissModal();
    } else {
      switch (this.currentStepIndex) {
        case 2:
          this.createInstallFile();
          break;
        case 3:
          this.createSftp();
          break;
        case 4:
          this.createSoftwareProfile();
          break;
        default:
      }
    }
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
