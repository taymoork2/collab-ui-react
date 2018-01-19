import { IDirectorySync } from './index';
import { Notification } from 'modules/core/notifications';
import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';

export class MultiDirSyncService {
  private readonly ENABLED = 'ENABLED';
  private baseOptions: IToolkitModalSettings = {
    type: 'dialog',
    close: this.$translate.instant('common.turnOff'),
    dismiss: this.$translate.instant('common.cancel'),
  };

  /* @ngInject */
  public constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
    private UrlConfig,
  ) {}

  public getDomains(domain?: string) {
    let URL: string = `${this.baseUrl}configurations/domains`;
    if (domain) {
      URL += `/${domain}`;
    }

    return this.$http.get(URL);
  }

  public getEnabledDomains() {
    return this.getDomains().then((response: any) => {
      let responseArray: IDirectorySync[] = _.get(response, 'data.directorySyncResponseBeans', []);
      responseArray = _.filter(responseArray, (site: IDirectorySync) => {
        return site.serviceMode === this.ENABLED;
      });

      _.forEach(responseArray, (dirsync: IDirectorySync) => {
        const isInService = { isInService: true };
        dirsync.siteStatus = 'success';

        if (!_.every(dirsync.connectors, isInService)) {
          if (_.some(dirsync.connectors, isInService)) {
            dirsync.siteStatus = 'warning';
          } else {
            dirsync.siteStatus = 'danger';
          }
        }
      });

      return responseArray;
    });
  }

  public deactivateConnectorsModal(connectorName: string) {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.deactivate', { connectorName: connectorName });
    options.message = this.$translate.instant('globalSettings.multiDirsync.deactivateConnectorMessage');
    options.close = this.$translate.instant('common.deactivate');

    return this.$q((resolve, reject) => {
      this.ModalService.open(options).result.then(() => {
        this.deleteConnector(connectorName).catch((error) => {
          this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.connectorError', {
            connectorName: connectorName,
          });
        }).finally(() => {
          resolve('refresh');
        });
      }).catch(() => {
        reject('closed');
      });
    });
  }

  public deleteAllDomainsModal() {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.turnOffAllTitle');
    options.message = this.$translate.instant('globalSettings.multiDirsync.turnOffAllMessage');

    return this.$q((resolve, reject) => {
      this.ModalService.open(options).result.then(() => {
        this.deactivateDomain().catch((error) => {
          this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.deleteAllError');
        }).finally(() => {
          resolve('refresh');
        });
      }).catch(() => {
        reject('closed');
      });
    });
  }

  public deleteDomainModal(domainName: string) {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.turnOff', { domainName: domainName });
    options.message = this.$translate.instant('globalSettings.multiDirsync.turnOffDomainMessage');

    return this.$q((resolve, reject) => {
      this.ModalService.open(options).result.then(() => {
        this.deactivateDomain(domainName).catch((error) => {
          this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.deleteError', {
            domainName: domainName,
          });
        }).finally(() => {
          resolve('refresh');
        });
      }).catch(() => {
        reject('closed');
      });
    });
  }

  public domainsErrorNotification(error) {
    // Bad Request is returned when the customer has no domains; error should be quietly hidden as 'no domains' is a valid state.
    if (_.get(error, 'status') !== 400) {
      this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.domainsError');
    }
  }

  private get baseUrl() {
    return `${this.UrlConfig.getAdminServiceUrl()}organization/${this.Authinfo.getOrgId()}/dirsync/`;
  }

  private deactivateDomain(domain?: string) {
    let URL: string = `${this.baseUrl}mode`;
    if (domain) {
      URL += `/domains/${domain}`;
    }

    return this.$http.patch(URL, {}, {
      params: {
        enabled: false,
      },
    });
  }

  private deleteConnector(name: string) {
    return this.$http.delete(`${this.baseUrl}connector`, {
      params: { name },
    });
  }
}
