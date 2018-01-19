import { Analytics } from 'modules/core/analytics';
import { MultiDirSyncService } from '../multiDirsync.service';
import { IDirectorySync } from '../index';

interface IStateWithModal extends ng.ui.IStateService {
  modal: any;
}

export class MultiDirSyncSectionController {
  public dirSyncArray: IDirectorySync[] = [];
  public dirsyncEnabled = false;
  public dirsyncUpdating = true;

  /* @ngInject */
  public constructor(
    private $state: IStateWithModal,
    private Analytics: Analytics,
    private MultiDirSyncService: MultiDirSyncService,
  ) {}

  public $onInit(): void {
    this.refresh();
  }

  public refresh() {
    this.dirsyncUpdating = true;
    this.MultiDirSyncService.getEnabledDomains().then((enabledDomains: IDirectorySync[]) => {
      this.dirsyncUpdating = false;
      this.dirSyncArray = enabledDomains;

      if (this.dirSyncArray.length > 0) {
        this.dirsyncEnabled = true;
      }
    }).catch((error) => {
      this.dirsyncUpdating = false;
      this.dirsyncEnabled = false;
      this.MultiDirSyncService.domainsErrorNotification(error);
    });
  }

  public deleteDomain(site: IDirectorySync) {
    this.MultiDirSyncService.deleteDomainModal(site.domains[0].domainName).then(() => {
      this.refresh();
    });
  }

  public goToInitialize() {
    this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, this.Analytics.sections.ADD_USERS.uploadMethods.SYNC);
    this.$state.go('users.manage.advanced.add.ob.installConnector');
  }

  public goToSettings() {
    this.$state.modal.closed.then(() => {
      this.$state.go('settings', {
        showSettings: 'dirsync',
      });
    });
    this.$state.modal.dismiss();
  }
}

export class MultiDirSyncSectionComponent implements ng.IComponentOptions {
  public controller = MultiDirSyncSectionController;
  public template = require('./multi-dirsync-section.tpl.html');
}
