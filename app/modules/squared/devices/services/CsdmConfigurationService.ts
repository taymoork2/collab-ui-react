import { IHttpPromise, IHttpService } from 'angular';

export interface IConfigRule<T> {
  url: string;
  value: T;
}

export class CsdmConfigurationService {
  private configUrl: string;
  private notifyUrl: string;

  /* @ngInject  */
  constructor(private $http: IHttpService, private Authinfo, UrlConfig) {
    this.configUrl = UrlConfig.getLyraServiceUrl() + '/configuration/rules';
    this.notifyUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/devices/update';
  }

  public getRuleForPlace<T>(cisUuid: string, key: string): IPromise<IConfigRule<T>>  {
    return this.$http.get<IConfigRule<T>>(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/accounts/' + cisUuid + '/' + key).then((res) => {
      return res.data;
    });
  }

  public updateRuleForPlace<T>(cisUuid: string, key: string, value): IHttpPromise<IConfigRule<T>> {
    return this.$http.put(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/accounts/' + cisUuid + '/' + key, {
      value: value,
      enforced: false,
    });
  }

  public getRuleForOrg<T>(key: string): IPromise<IConfigRule<T>> {
    return this.$http.get<IConfigRule<T>>(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/' + key).then((res) => {
      return res.data;
    });
  }

  public updateRuleForOrg<T>(key: string, value): IHttpPromise<IConfigRule<T>> {
    return this.$http.put<IConfigRule<T>>(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/' + key, {
      value: value,
      enforced: false,
    });
  }

  public notifyOrgSetting() {
    return this.$http.post(this.notifyUrl, {
      searchRequest: { query: null, size: 31337, from: 0 },
      updateCommand: {
        type: 'notify',
        notification: 'configurationChanged',
      },
    });
  }

  public deleteRuleForOrg(key: string) {
    return this.$http.delete(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/' + key);
  }
}

module.exports = angular
  .module('Squared')
  .service('CsdmConfigurationService', CsdmConfigurationService)
  .name;
