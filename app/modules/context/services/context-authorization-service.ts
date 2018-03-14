export interface IContextAdminAuthorizationService {
  getAdminAuthorizationStatus(): IPromise<AdminAuthorizationStatus>;
  synchronizeAdmins(): IPromise<ng.IHttpResponse<{}>>;
}

export enum AdminAuthorizationStatus {
  AUTHORIZED = 'Authorized',
  UNAUTHORIZED = 'Unauthorized',
  UNKNOWN = 'Unknown',
  NEEDS_MIGRATION = 'NeedsMigration',
}

export class ContextAdminAuthorizationService implements IContextAdminAuthorizationService {

  private featureOn: ng.IPromise<boolean>;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
    private $log: ng.ILogService,
    private FeatureToggleService,
    private $q: ng.IQService,
  ) {
  }

  public getAdminAuthorizationStatus(): IPromise<AdminAuthorizationStatus> {
    const ADMIN_AUTHORIZATION_URL = '/AdminAuthorizationStatus/';
    const adminAuthorizationStatusUrl = [this.UrlConfig.getContextCcfsUrl(), `${ADMIN_AUTHORIZATION_URL}${this.Authinfo.getOrgId()}`].join('');
    const orgNeedsMigration = 'ORG_NEEDS_MIGRATION';

    this.featureOn = this.$q.resolve(false);
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasContextServiceOnboarding)
      .then(supports => {
        this.featureOn = supports;
      })
      .then(() => {
        if (!this.featureOn) {
          return this.$q.resolve(AdminAuthorizationStatus.AUTHORIZED);
        }

        return this.$http.get(adminAuthorizationStatusUrl)
          .then(response => {
            if (response.status === 200) {
              return AdminAuthorizationStatus.AUTHORIZED;
            } else {
              this.$log.info(`getAdminAuthorized returns unknown authorized status response status ${response.status} response data`, response.data);
              return AdminAuthorizationStatus.UNKNOWN;
            }
          })
          .catch(response => {
            const statusText = _.get(response, 'data.error.statusText');
            if (response.status === 403) {
              return AdminAuthorizationStatus.UNAUTHORIZED;
            } else if (response.status === 400 && (statusText === orgNeedsMigration)) {
              return AdminAuthorizationStatus.NEEDS_MIGRATION;
            } else {
              this.$log.info(`getAdminAuthorized returns unknown authorized status response status ${response.status} response data`, response.data);
              return AdminAuthorizationStatus.UNKNOWN;
            }
          });
      });
  }

  public isAdminAuthorized(): IPromise<boolean> {
    return this.getAdminAuthorizationStatus().then((status: AdminAuthorizationStatus) => status === AdminAuthorizationStatus.AUTHORIZED);
  }

  public isMigrationNeeded(): IPromise<boolean> {
    return this.getAdminAuthorizationStatus().then((status: AdminAuthorizationStatus) => status === AdminAuthorizationStatus.NEEDS_MIGRATION);
  }

  /**
   * Get the list of Partner Administrators
   * @returns {IPromise<string[]>} a string array of partner admin IDs
   */
  protected getPartnerAdminIDs(): IPromise<string[]> {
    const partnerAdminListUrl = this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/partneradmins';
    return this.$http.get(partnerAdminListUrl)
      .then(response => {
        return _.map(_.get(response.data, 'partners', []), 'id');
      });
  }

  /**
   * Synchronize Administrator permissions - both Customer and Partner admins
   * @returns {IPromise<angular.IHttpResponse<{}>>}
   */
  public synchronizeAdmins(): IPromise<ng.IHttpResponse<{}>> {
    const synchronizeAdminsUrl = this.UrlConfig.getContextCcfsUrl() + '/admin/authorizationSync';
    const payload: any = {
      orgId: this.Authinfo.getOrgId(),
      partnerIds: [],
    };

    return this.getPartnerAdminIDs()
      .then(partnerAdminIDs => {
        payload.partnerIds = partnerAdminIDs;
        return this.$http.post(synchronizeAdminsUrl, payload);
      });
  }

  /**
   * Migrate Organization - both Customer and Partner admins
   * @returns {IPromise<angular.IHttpResponse<{}>>}
   */
  public migrateOrganization(): IPromise<ng.IHttpResponse<{}>> {
    const migrateOrganizationUrl = this.UrlConfig.getContextCcfsUrl() + '/migrate';
    const payload: any = {
      orgId: this.Authinfo.getOrgId(),
      partnerIds: [],
    };

    return this.getPartnerAdminIDs()
      .then(partnerAdminIDs => {
        payload.partnerIds = partnerAdminIDs;
        return this.$http.post(migrateOrganizationUrl, payload);
      });
  }
}

export default angular
  .module('context.services.context-authorization-service', [])
  .service('ContextAdminAuthorizationService', ContextAdminAuthorizationService)
  .name;
