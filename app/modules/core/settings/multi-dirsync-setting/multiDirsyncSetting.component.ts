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
      this.turnOffDomain('globalSettings.multiDirsync.deleteAllError');
    });
  }

  public deleteDomain(domain: IDomain): void {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.turnOff', { domainName: domain.domainName });
    options.message = this.$translate.instant('globalSettings.multiDirsync.turnOffDomainMessage');

    this.ModalService.open(options).result.then(() => {
      this.turnOffDomain('globalSettings.multiDirsync.deleteError', domain.domainName);
    });
  }

  private turnOffDomain(errorMessage: string, domain?: string) {
    this.MultiDirSyncSettingService.deactivateDomain(domain).catch((error) => {
      this.Notification.errorWithTrackingId(error, errorMessage, {
        domainName: domain,
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
  public template = require('./multiDirsyncSetting.tpl.html');
}
