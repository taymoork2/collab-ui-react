
export interface IDirSyncService {
  isDirSyncEnabled(): boolean;
  getConnectors(): Array<IDirectoryConnector>;
  orgInfo: IDirSyncInfo;
  requiresRefresh(): boolean;

  refreshStatus(): ng.IPromise<void>;
  disableSync(): ng.IPromise<void>;
  deregisterConnector(connector: IDirectoryConnector): ng.IPromise<void>;
}

export interface IDirectoryConnector {
  name: string;
  isInService: boolean;
  deregister(): ng.IPromise<void>;
}

export interface IDirSyncInfo {
  incrSyncInterval?: number;
  serviceMode: string;
  fullSyncEnabled?: boolean;
  attrMappings?: Array<Object>;
  domains?: Array<Object>;
}

interface IDirectoryConnectors extends ng.resource.IResource<IDirectoryConnectors> {
  connectors: Array<IDirectoryConnector>;
}

interface IDirectoryConnectorsResource extends ng.resource.IResourceClass<IDirectoryConnectors> {
}

interface IDirSyncOrgResource extends ng.resource.IResourceClass<ng.resource.IResource<IDirSyncInfo>> {
}

interface IDirSyncModeResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {
  disable: ng.resource.IResourceMethod<ng.resource.IResource<any>>;
}

/**
 * Service that handles all DirSync interaction from Atlas
 * NOTE: Be sure to call refreshStatus() before accessing data to ensure it up to date
 */
export class DirSyncService implements IDirSyncService {
  private readonly MODE_ENABLED = 'ENABLED';

  private connectorsResource: IDirectoryConnectorsResource;
  private dirConnectors: IDirectoryConnectors;
  private orgInfoResource: IDirSyncOrgResource;
  private dirSyncModeResource: IDirSyncModeResource;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private UrlConfig,
    private Authinfo,
  ) {
    const baseUrl = this.UrlConfig.getAdminServiceUrl() + 'organization/:customerId/dirsync';
    this.orgInfoResource = <IDirSyncOrgResource>this.$resource(baseUrl, { customerId: '@customerId' });
    this.dirSyncModeResource = <IDirSyncModeResource>this.$resource(baseUrl + '/mode', { customerId: '@customerId' }, { disable: { method: 'PATCH', params: { enabled: false } } });
    this.connectorsResource = <IDirectoryConnectorsResource>this.$resource(baseUrl + '/connector', { customerId: '@customerId' });
  }

  public orgInfo: IDirSyncInfo;

  /**
   * Returns true if the orgInfo has not been initialized by calling refreshStatus()
   */
  public requiresRefresh(): boolean {
    return _.isUndefined(this.orgInfo);
  }

  /**
   * Promise resolved with true when DirSync enabled, false when disabled
   */
  public isDirSyncEnabled(): boolean {
    return (_.isEqual(_.get(this.orgInfo, 'serviceMode', false), this.MODE_ENABLED));
  }

  /**
   * Promise resolve with list of IDirectoryConnectors available
   */
  public getConnectors(): Array<IDirectoryConnector> {
    return _.get(this.dirConnectors, 'connectors', []);
  }

  /**
   * Refreshes the directory sync status and connectors list
   */
  public refreshStatus(): ng.IPromise<void> {

    // clear existing data
    this.orgInfo = <IDirSyncInfo>{ serviceMode: 'DISABLED' };
    this.dirConnectors = <IDirectoryConnectors>{ connectors: new Array<IDirectoryConnector>() };

    // fetch DirSync status
    return this.orgInfoResource.get({ customerId: this.Authinfo.getOrgId() }).$promise
      .then((orgInfo: IDirSyncInfo) => {
        this.orgInfo = orgInfo;
      })
      .then(() => {
        // fetch Directory Connector list
        return this.connectorsResource.get({ customerId: this.Authinfo.getOrgId() }).$promise
          .then((connectors) => {
            this.dirConnectors = connectors;
          });
      })
      .catch(_.noop) // squelch errors
      .finally(() => this.$q.resolve());
  }

  /**
   * Disable Directory Syncronization
   */
  public disableSync(): ng.IPromise<any> {
    return this.dirSyncModeResource.disable({ customerId: this.Authinfo.getOrgId() }).$promise;
  }

  /**
   * Deregister a Directory Connector
   */
  public deregisterConnector(connector: IDirectoryConnector): ng.IPromise<any> {
    return this.connectorsResource.delete({ customerId: this.Authinfo.getOrgId(), name: connector.name }).$promise;
  }

}
