export class MultiDirSyncSettingService {
  private readonly baseUrl = `${this.UrlConfig.getAdminServiceUrl()}organization/${this.Authinfo.getOrgId()}/dirsync/`;

  /* @ngInject */
  public constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {}

  public getDomains(domain?: string) {
    let URL: string = `${this.baseUrl}configurations/domains`;
    if (domain) {
      URL += `/${domain}`;
    }

    return this.$http.get(URL);
  }

  public deleteConnector(connector: string) {
    return this.$http.delete(`${this.baseUrl}connector?name=${connector}`);
  }

  public deactivateDomain(domain?: string) {
    let URL: string = `${this.baseUrl}mode`;
    if (domain) {
      URL += `/domains/${domain}`;
    }

    return this.$http.patch(`${URL}?enabled=false`, {});
  }
}
