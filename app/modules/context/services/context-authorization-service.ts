export interface IContextAdminAuthorizationService {
  getAdminAuthorizationStatus(): IPromise<AdminAuthorizationStatus>;
}

export enum AdminAuthorizationStatus {
  AUTHORIZED = 'Authorized',
  UNAUTHORIZED = 'Unauthorized',
  UNKNOWN = 'Unknown',
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
            if (response.status === 403) {
              return AdminAuthorizationStatus.UNAUTHORIZED;
            } else {
              this.$log.info(`getAdminAuthorized returns unknown authorized status response status ${response.status} response data`, response.data);
              return AdminAuthorizationStatus.UNKNOWN;
            }
          });
      });
  }
}

export default angular
  .module('Context')
  .service('ContextAdminAuthorizationService', ContextAdminAuthorizationService)
  .name;
