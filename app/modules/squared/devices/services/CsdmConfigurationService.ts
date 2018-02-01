export class CsdmConfigurationService {
  private configUrl: string;
  private notifyUrl: string;

  /* @ngInject  */
  constructor(private $http, private Authinfo, UrlConfig) {
    this.configUrl = UrlConfig.getLyraServiceUrl() + '/configuration/rules';
    this.notifyUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/devices/update';
  }

  public getRuleForPlace(cisUuid, key) {
    return this.$http.get(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/accounts/' + cisUuid + '/' + key).then((res) => {
      return res.data;
    });
  }

  public updateRuleForPlace(cisUuid, key, value) {
    return this.$http.put(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/accounts/' + cisUuid + '/' + key, {
      value: value,
      enforced: false,
    });
  }

  public getRuleForOrg(key) {
    return this.$http.get(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/' + key).then((res) => {
      return res.data;
    });
  }

  public updateRuleForOrg(key, value) {
    return this.$http.put(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/' + key, {
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

  public deleteRuleForOrg(key) {
    return this.$http.delete(this.configUrl + '/organization/' + this.Authinfo.getOrgId() + '/' + key);
  }
}

module.exports = angular
  .module('Squared')
  .service('CsdmConfigurationService', CsdmConfigurationService)
  .name;
