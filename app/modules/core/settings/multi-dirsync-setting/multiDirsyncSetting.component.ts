import { MultiDirSyncSettingService } from './multiDirsync.service';
import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';

export interface IDirectoryConnector {
  isInService: boolean;
  name: string;
}

export interface IDirectorySync {
  domains: IDomain[];
  connectors: IDirectoryConnector[];
}

export interface IDomain {
  domainName: string;
}

export class MultiDirSyncSettingController {
  public updatingStatus: boolean;
  public dirSyncEnabled: boolean;
  public dirSyncArray: IDirectorySync[] = [];

  private baseOptions: IToolkitModalSettings = {
    type: 'dialog',
    close: this.$translate.instant('common.turnOff'),
    dismiss: this.$translate.instant('common.cancel'),
  };

  /* @ngInject */
  public constructor(
    private $translate: ng.translate.ITranslateService,
    private ModalService: IToolkitModalService,
    private MultiDirSyncSettingService: MultiDirSyncSettingService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    this.refresh();
  }

  public deactivateConnector(connector: IDirectoryConnector): void {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.deactivate', { connectorName: connector.name });
    options.message = this.$translate.instant('globalSettings.multiDirsync.deactivateConnectorMessage');
    options.close = this.$translate.instant('common.deactivate');

    this.ModalService.open(options).result.then(() => {
      this.MultiDirSyncSettingService.deleteConnector(connector.name).catch((error) => {
        this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.connectorError', {
          connectorName: connector.name,
        });
      }).finally(() => {
        this.refresh();
      });
    });
  }

  public deleteAll(): void {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.turnOffAllTitle');
    options.message = this.$translate.instant('globalSettings.multiDirsync.turnOffAllMessage');

    this.ModalService.open(options).result.then(() => {
      this.deleteDomain('globalSettings.multiDirsync.deleteAllError');
    });
  }

  public deleteSite(site: any): void {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.turnOff', { siteName: site.domainName });
    options.message = this.$translate.instant('globalSettings.multiDirsync.turnOffSiteMessage');

    this.ModalService.open(options).result.then(() => {
      this.deleteDomain('globalSettings.multiDirsync.deleteError', site.domainName);
    });
  }

  private deleteDomain(errorMessage: string, domain?: string) {
    this.MultiDirSyncSettingService.deactivateDomain(domain).catch((error) => {
      this.Notification.errorWithTrackingId(error, errorMessage, {
        siteName: domain,
      });
    }).finally(() => {
      this.refresh();
    });
  }

  private refresh(): void {
    this.updatingStatus = true;
    this.MultiDirSyncSettingService.getDomains().then((result: any) => {
      this.updatingStatus = false;
      this.dirSyncArray = result.data.directorySyncResponseBeans;

      if (this.dirSyncArray.length > 0) {
        this.dirSyncEnabled = true;
      }
    })
    .catch((error) => {
      this.updatingStatus = false;
      this.dirSyncEnabled = false;
      this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.domainsError');
    });
  }
}

export class MultiDirSyncSettingComponent implements ng.IComponentOptions {
  public controller = MultiDirSyncSettingController;
  public template = require('modules/core/settings/multi-dirsync-setting/multiDirsyncSetting.tpl.html');
}
