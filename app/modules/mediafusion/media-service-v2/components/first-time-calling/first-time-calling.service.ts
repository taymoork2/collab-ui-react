export class FirstTimeCallingService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {
  }

  public getServiceStatus(clusterName: string, callType: string): ng.IPromise<any> {
    return this.$http.get<any>(`${this.UrlConfig.getAthenaServiceUrl()}/organizations/${this.Authinfo.getOrgId()}/cluster/${clusterName}/first_time_calling/?relativeTime=15m&callType=${callType}`)
      .then(response => response.data);
  }
}

export default angular
  .module('mediafusion.media-service-v2.components.first-time-calling', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/urlConfig'),
  ])
  .service('FirstTimeCallingService', FirstTimeCallingService)
  .name;
