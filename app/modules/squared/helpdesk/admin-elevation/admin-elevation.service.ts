
export class AdminElevationService {

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $http: ng.IHttpService,
              private UrlConfig) {
  }

  public validateSignature(orgId: string, signature: string, customerUserId: string, userId: string, timestamp: string): ng.IPromise<any> {
    const urlToUse = this.getUrlToUse(orgId, 'elevationrequest/' + userId,
      {
        name: 'signature',
        value: signature,
      },
      {
        name: 'customerUserId',
        value: customerUserId,
      },
      {
        name: 'userId',
        value: userId,
      },
      {
        name: 'timestamp',
        value: timestamp,
      });
    return this.$http.get(urlToUse).then((response) => {
      return response.data;
    }).catch((error) => {
      this.$log.debug('error', error);
      throw error;
    });
  }

  public invalidateSignature(orgId: string, signature: string, userId: string, timestamp: string, customerUserId: string): ng.IPromise<any> {
    const urlToUse = this.getUrlToUse(orgId, 'elevationrequest/' + userId,
      {
        name: 'signature',
        value: signature,
      },
      {
        name: 'timestamp',
        value: timestamp,
      },
      {
        name: 'userId',
        value: userId,
      },
      {
        name: 'customerUserId',
        value: customerUserId,
      });
    return this.$http.delete(urlToUse, {}).then((response) => {
      return response.data;
    }).catch((error) => {
      this.$log.debug('error', error);
      throw error;
    });
  }

  public elevateToAdmin(orgId: string, signature: string, userId: string, timestamp: string, customerUserId: string): ng.IPromise<any> {
    const urlToUse = this.getUrlToUse(orgId, 'actions/elevatetofulladmin/invoke');
    return this.$http.post(urlToUse, {
      signature: signature,
      userId: userId,
      customerUserId: customerUserId,
      timestamp: timestamp,
    }).then((response) => {
      return response.data;
    }).catch((error) => {
      this.$log.debug('error', error);
      throw error;
    });
  }

  private getUrlToUse(orgId: string, partialPath: string, ...params: { name: string, value: string }[]): string {
    let urlToUse: string = this.UrlConfig.getAdminServiceUrl() + 'helpdesk/organizations/';
    urlToUse += orgId + '/';
    urlToUse += partialPath;
    if (params.length > 0) {
      urlToUse += '?';
    }
    _.each(params, (param) => {
      urlToUse += param.name + '=' + param.value + '&';
    });
    return urlToUse;
  }
}
