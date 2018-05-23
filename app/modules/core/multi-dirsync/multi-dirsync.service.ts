import { IDirectorySync } from './index';
import { Notification } from 'modules/core/notifications';
import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';

export class MultiDirSyncService {
  private readonly ENABLED = 'ENABLED';
  private isRefreshed: boolean = false;
  private isEnabled: boolean = false;

  /* @ngInject */
  public constructor(
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private Authinfo,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
    private Orgservice,
    private UrlConfig,
  ) {}

  public getDomains(domain?: string): ng.IHttpPromise<any> {
    let URL: string = `${this.baseUrl}configurations/domains`;
    if (domain) {
      URL += `/${domain}`;
    }

    return this.$http.get(URL);
  }

  public getEnabledDomains(): ng.IPromise<IDirectorySync[]> {
    return this.getDomains().then((response) => {
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

      this.isRefreshed = true;
      this.isEnabled = responseArray.length > 0;

      return responseArray;
    });
  }

  public isDirsyncEnabled(): ng.IPromise<boolean> {
    return this.$q((resolve) => {
      if (this.isRefreshed) {
        resolve(this.isEnabled);
      } else {
        let promise: ng.IPromise<any>;
        if (this.Authinfo.isAdmin()) {
          promise = this.getEnabledDomains().catch(() => {
            this.isRefreshed = true;
            this.isEnabled = false;
          });
        } else { // User Admins, for example, are unable to hit the dirsync APIs and should fall back to OrgService
          promise = this.Orgservice.getOrg(_.noop, null, {
            basicInfo: true,
          }).then((response) => {
            this.isRefreshed = true;
            this.isEnabled = _.get(response, 'data.dirsyncEnabled', false);
          });
        }
        promise.finally(() => {
          resolve(this.isEnabled);
        });
      }
    });
  }

  public deactivateConnectorsModal(connectorName: string) {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.deactivate', { connectorName: connectorName });
    options.message = this.$translate.instant('globalSettings.multiDirsync.deactivateConnectorMessage');
    options.close = this.$translate.instant('common.deactivate');

    return this.ModalService.open(options).result.then(() => {
      return this.deleteConnector(connectorName).catch((error) => {
        this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.connectorError', {
          connectorName: connectorName,
        });
      });
    });
  }

  public deleteAllDomainsModal() {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.turnOffAllTitle');
    options.message = this.$translate.instant('globalSettings.multiDirsync.turnOffAllMessage');

    return this.ModalService.open(options).result.then(() => {
      return this.deactivateDomain().catch((error) => {
        this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.deleteAllError');
      });
    });
  }

  public deleteDomainModal(domainName: string) {
    const options: IToolkitModalSettings = _.cloneDeep(this.baseOptions);
    options.title = this.$translate.instant('globalSettings.multiDirsync.turnOff', { domainName: domainName });
    options.message = this.$translate.instant('globalSettings.multiDirsync.turnOffDomainMessage');

    return this.ModalService.open(options).result.then(() => {
      return this.deactivateDomain(domainName).catch((error) => {
        this.Notification.errorWithTrackingId(error, 'globalSettings.multiDirsync.deleteError', {
          domainName: domainName,
        });
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

  private get baseOptions(): IToolkitModalSettings {
    return {
      type: 'dialog',
      close: this.$translate.instant('common.turnOff'),
      dismiss: this.$translate.instant('common.cancel'),
    };
  }

  private deactivateDomain(domain?: string) {
    let URL: string = `${this.baseUrl}mode`;
    if (domain) {
      URL += `/domains/${domain}`;
    }

    this.isRefreshed = false;
    return this.$http.patch(URL, {}, {
      params: {
        enabled: false,
      },
    });
  }

  private deleteConnector(name: string) {
    this.isRefreshed = false;
    return this.$http.delete(`${this.baseUrl}connector`, {
      params: { name },
    });
  }
}
