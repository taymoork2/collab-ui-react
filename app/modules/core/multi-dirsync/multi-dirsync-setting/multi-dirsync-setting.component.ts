import { MultiDirSyncService } from '../multiDirsync.service';
import { IDirectoryConnector, IDirectorySync, IDomain } from '../index';

export class MultiDirSyncSettingController {
  public updatingStatus: boolean;
  public dirSyncEnabled: boolean;
  public dirSyncArray: IDirectorySync[] = [];

  /* @ngInject */
  public constructor(
    private MultiDirSyncService: MultiDirSyncService,
  ) {}

  public $onInit(): void {
    this.refresh();
  }

  public deactivateConnector(connector: IDirectoryConnector): void {
    this.MultiDirSyncService.deactivateConnectorsModal(connector.name).then(() => {
      this.refresh();
    });
  }

  public deleteAll(): void {
    this.MultiDirSyncService.deleteAllDomainsModal().then(() => {
      this.refresh();
    });
  }

  public deleteDomain(domain: IDomain): void {
    this.MultiDirSyncService.deleteDomainModal(domain.domainName).then(() => {
      this.refresh();
    });
  }

  private refresh(): void {
    this.updatingStatus = true;
    this.MultiDirSyncService.getEnabledDomains().then((enabledDomains: IDirectorySync[]) => {
      this.updatingStatus = false;
      this.dirSyncArray = enabledDomains;

      if (this.dirSyncArray.length > 0) {
        this.dirSyncEnabled = true;
      }
    })
    .catch((error) => {
      this.updatingStatus = false;
      this.dirSyncEnabled = false;
      this.MultiDirSyncService.domainsErrorNotification(error);
    });
  }
}

export class MultiDirSyncSettingComponent implements ng.IComponentOptions {
  public controller = MultiDirSyncSettingController;
  public template = require('./multi-dirsync-setting.tpl.html');
}
