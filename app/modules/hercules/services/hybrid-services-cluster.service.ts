export class HybridServicesClusterService {
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {
    this.extractDataFromResponse = this.extractDataFromResponse.bind(this);
  }

  public setClusterInformation(clusterId: string, data: { name?: string; releaseChannel?: string; }): ng.IPromise<any> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}`;
    return this.$http.patch(url, data)
      .then(this.extractDataFromResponse);
  }

  private extractDataFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>): T {
    return _.get<T>(response, 'data');
  }
}

export default angular
  .module('Hercules')
  .service('HybridServicesClusterService', HybridServicesClusterService)
  .name;
