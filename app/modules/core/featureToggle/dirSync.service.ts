
export interface IDirSyncService {
  isDirSyncEnabled(): boolean;
  getConnectors(): Array<IDirectoryConnector>;
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
  private managementApiResource: IDirSyncOrgResource;
  private dirSyncModeResource: IDirSyncModeResource;
  private dirSyncEnabled: boolean = false;
  private requireRefresh: boolean = true;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private UrlConfig,
    private Authinfo,
    private Orgservice,
  ) {
    // This is the management API to use with Full-Admin only!
    const baseUrl = this.UrlConfig.getAdminServiceUrl() + 'organization/:customerId/dirsync';
    this.managementApiResource = <IDirSyncOrgResource>this.$resource(baseUrl, { customerId: '@customerId' });
    this.dirSyncModeResource = <IDirSyncModeResource>this.$resource(baseUrl + '/mode', { customerId: '@customerId' }, { disable: { method: 'PATCH', params: { enabled: false } } });
    this.connectorsResource = <IDirectoryConnectorsResource>this.$resource(baseUrl + '/connector', { customerId: '@customerId' });
  }

  /**
   * Returns true if the orgInfo has not been initialized by calling refreshStatus()
   */
  public requiresRefresh(): boolean {
    return this.requireRefresh;
  }

  /**
   * Promise resolved with true when DirSync enabled, false when disabled
   */
  public isDirSyncEnabled(): boolean {
    return this.dirSyncEnabled;
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
    this.dirConnectors = <IDirectoryConnectors>{ connectors: new Array<IDirectoryConnector>() };

    // if Full-admin, then get dirsync status from ManagementAPI.  Otherwise, we need to
    // get it from OrgAPI.
    let dsPromise: ng.IPromise<void>;
    if (this.Authinfo.isAdmin()) {
      // get status from the Management API
      dsPromise = this.managementApiResource.get({ customerId: this.Authinfo.getOrgId() }).$promise
        .then((orgInfo: IDirSyncInfo) => {
          this.dirSyncEnabled = (_.isEqual(_.get(orgInfo, 'serviceMode', false), this.MODE_ENABLED));
        });
    } else {
      // get status from the CI org api
      dsPromise = this.$q<void>( (resolve, reject) => {
        this.Orgservice.getOrg( (data: IDirSyncInfo, status: Number) => {
          if ( status === 200 ) {
            this.dirSyncEnabled = _.get(data, 'dirsyncEnabled', false);
            resolve();
          } else {
            reject();
          }
        }, null, { basicInfo: true });
      });
    }

    return dsPromise
      .then(() => {
        // fetch Directory Connector list
        return this.connectorsResource.get({ customerId: this.Authinfo.getOrgId() }).$promise
          .then((connectors) => {
            this.dirConnectors = connectors;
          });
      })
      .then(() => { this.requireRefresh = false; })
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
