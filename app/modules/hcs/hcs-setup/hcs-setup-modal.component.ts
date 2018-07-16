import { HcsSetupModalService, HcsUpgradeService, HcsControllerService, IHcsInstallables } from 'modules/hcs/hcs-shared';
import { ICheckbox } from './hcs-setup';
import { ISoftwareProfile } from 'modules/hcs/hcs-shared/hcs-swprofile';
import { ISftpServer } from './hcs-setup-sftp';
import { Notification } from 'modules/core/notifications';

export class HcsSetupModalCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 5;
  private static readonly FIRST_INDEX: number = 0;
  private static readonly LICENSING: string = 'LICENSING';
  private static readonly LAAS: string = 'ucmgmt-laas';
  private static readonly UPGRADE: string = 'UPGRADE';
  private static readonly UAAS: string = 'ucmgmt-uaas';

  public currentStepIndex: number;
  public hcsServices: ICheckbox;
  public agentInstallFile: IHcsInstallables;
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
    private HcsControllerService: HcsControllerService,
    private Notification: Notification,
    private $state: ng.ui.IStateService,
    private Auth,
    private Authinfo,
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
    } else {
      this.hcsServices = { license: false, upgrade: false };
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
        this.createHcsPartner();
        this.title = 'hcs.installFiles.setupTitle';
        if (this.hcsSetupModalForm) {
          this.hcsSetupModalForm.$setPristine();
        }
        this.nextEnabled = false;
        break;
      case 3:
        this.createInstallFile();
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
        this.createSoftwareProfile();
        this.cancelRemoved = true;
        this.finish = true;
        this.finishDisable = false;
        this.title = 'hcs.setup.finish';
        break;
      default:
        this.dismissModal();
    }
  }

  public createHcsPartner(): void {
    const services: string[] = [];
    const entitlements: string[] = [];
    if (this.hcsServices.license) {
      services.push(HcsSetupModalCtrl.LICENSING);
      entitlements.push(HcsSetupModalCtrl.LAAS);
    }
    if (this.hcsServices.upgrade) {
      services.push(HcsSetupModalCtrl.UPGRADE);
      entitlements.push(HcsSetupModalCtrl.UAAS);
    }
    this.HcsControllerService.createHcsPartner(services)
    //Update the entitlement
      .then(() => this.HcsControllerService.updateUserEntitlement(this.Authinfo.getUserId(), entitlements))
    //update Bearer token with new
      .then(() => this.Auth.getAccessTokenWithNewScope());
  }

  public createSftp(): void {
    this.HcsUpgradeService.createSftpServer(this.sftpServer)
      .then(() => {
        this.loading = false;
        if (!this.isFirstTimeSetup) {
          this.Notification.success('hcs.sftp.success');
          this.$state.go(this.$state.current, {}, {
            reload: true,
          });
          this.dismissModal();
        }
      })
      .catch(e => {
        this.Notification.error('hcs.sftp.error', { message: e });
        this.loading = false;
        if (!this.isFirstTimeSetup) {
          this.dismissModal();
        }
      });
  }

  public createInstallFile(): void {
    this.HcsControllerService.createAgentInstallFile(this.agentInstallFile)
      .then(() => {
        this.loading = false;
        if (!this.isFirstTimeSetup) {
          this.Notification.success('hcs.installFiles.success');
          this.$state.go(this.$state.current, {}, {
            reload: true,
          });
          this.dismissModal();
        }
      })
      .catch(e => {
        this.Notification.error('hcs.installFiles.error', { message: e });
        this.loading = false;
        if (!this.isFirstTimeSetup) {
          this.dismissModal();
        }
      });
  }

  public createSoftwareProfile(): void {
    this.HcsUpgradeService.createSoftwareProfile(this.softwareProfile)
      .then(() => {
        this.loading = false;
        if (!this.isFirstTimeSetup) {
          this.Notification.success('hcs.softwareProfiles.success');
          this.$state.go(this.$state.current, {}, {
            reload: true,
          });
          this.dismissModal();
        }
      })
      .catch(e => {
        this.Notification.error('hcs.softwareProfiles.error', { message: e });
        this.loading = false;
        if (!this.isFirstTimeSetup) {
          this.dismissModal();
        }
      });
  }

  public disableNext(): boolean  {
    return !this.nextEnabled;
  }

  public selectHcsService(selected: ICheckbox): void {
    this.nextEnabled = (selected.license || selected.upgrade);
    this.hcsServices = selected;
  }

  public setAgentInstallFile(installable: IHcsInstallables): void {
    this.nextEnabled = !_.isUndefined(installable) && !_.isUndefined(installable.proxies) && installable.proxies.length > 0 && this.hcsSetupModalForm.$valid;
    this.agentInstallFile = installable;
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
    this.nextEnabled =  profile && this.hcsSetupModalForm.$valid && _.size(_.get(profile, 'applicationVersions')) > 0;
    this.softwareProfile = profile;
    this.enableSave();
  }

  public dismissModal(): void {
    this.$state.go(this.$state.current, {}, {
      reload: true,
    });
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
  public template = require('modules/hcs/hcs-setup/hcs-setup-modal.component.html');
  public bindings = {
    isFirstTimeSetup: '<',
    currentStepIndex: '<',
  };
}
