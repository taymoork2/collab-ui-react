export class HealthService {
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private UrlConfig,
  ) {}

  public getHealthStatus() {
    // TODO: move UrlConfig.getAdminServiceUrl() back to initialized variable
    // after environment initialization is moved to config provider
    return this.$http.get<{ serviceState: string }>(`${this.UrlConfig.getAdminServiceUrl()}ping`)
      .then((response) => response.data.serviceState);
  }
}
