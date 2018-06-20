import { IHttpService } from 'angular';

export class CsdmLyraConfigurationService {

  /* @ngInject */
  constructor(private $http: IHttpService, private UrlConfig, private Authinfo, private Utils) {

  }

  public getSchema(cisUuid: string, deviceWdmUrl: string): IPromise<any> {
    const configUrl = this.UrlConfig.getLyraServiceUrl() + '/configuration/rules';
    const encodedWdmUrl = this.Utils.Base64.encode(deviceWdmUrl);
    const url = configUrl + '/organization/' + this.Authinfo.getOrgId() + '/accounts/' + cisUuid + '/devices/' + encodedWdmUrl;
    return this.$http({
      method: 'OPTIONS',
      url: url,
    }).then((res) => {
      if (res.data && res.data['device']) {
        return res.data['device'];
      } else {
        return {};
      }
    });
  }

  public getConfig(cisUuid: string, deviceWdmUrl: string, key: string): IPromise<{ value: any }> {
    const configUrl = this.UrlConfig.getLyraServiceUrl() + '/configuration/rules';
    const encodedWdmUrl = this.Utils.Base64.encode(deviceWdmUrl);
    const url = configUrl + '/organization/' + this.Authinfo.getOrgId() + '/accounts/' + cisUuid + '/devices/' + encodedWdmUrl + '/' + key;
    return this.$http<{ value: any }>({
      method: 'GET',
      url: url,
    }).then((res) => {
      return res.data;
    });
  }

  public writeConfig(cisUuid: string, deviceWdmUrl: string, selectedKey: string, selectedValue: string): angular.IPromise<any> {
    const configUrl = this.UrlConfig.getLyraServiceUrl() + '/configuration/rules';
    const encodedWdmUrl = this.Utils.Base64.encode(deviceWdmUrl);
    const url = configUrl + '/organization/' + this.Authinfo.getOrgId() + '/accounts/' + cisUuid + '/devices/' + encodedWdmUrl + '/' + selectedKey;
    return this.$http.put(
      url, { value: selectedValue },
    ).then((res) => {
      return res.data;
    });
  }
}
