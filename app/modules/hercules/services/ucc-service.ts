export interface IUserDiscoveryInfo {
  directoryURI: string;
  primaryDn: string;
  telephoneNumber: string;
  UCMInfo: {
    ClusterFQDN: string;
  };
}

interface IResult {
  errors?: any;
  message: string;
  trackingId: string;
}

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

  public getUserDiscovery(userId: string, orgId?: string): ng.IPromise<IUserDiscoveryInfo> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http
      .get<IResult>(`${this.uccUrl}/userDiscovery/${orgId}/${userId}`)
      .then(this.extractData);
  }

}

import * as AuthinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as UrlConfigModuleName from 'modules/core/config/urlConfig';

export default angular
  .module('hercules.ucc-service', [
    AuthinfoModuleName,
    UrlConfigModuleName,
  ])
  .service('UCCService', UCCService)
  .name;
