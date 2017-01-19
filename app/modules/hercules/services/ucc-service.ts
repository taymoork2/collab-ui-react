export class UCCService {

  private uccUrl: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {
    this.uccUrl = this.UrlConfig.getUccUrl();
  }

  private extractData(res: any): any {
    return res.data;
  }

  public getUserDiscovery(userId: string, orgId?: string): ng.IPromise<any> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http
      .get(`${this.uccUrl}/userDiscovery/${orgId}/${userId}`)
      .then(this.extractData);
  }

}

export default angular
  .module('Hercules')
  .service('UCCService', UCCService)
  .name;
