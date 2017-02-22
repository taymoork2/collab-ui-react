export class TelephonyDomainService {

  private url;

  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
  ) {
    let gemUrl = this.UrlConfig.getGeminiUrl();
    this.url = {
      getTelephonyDomains: gemUrl + 'telephonyDomains/' + 'customerId/',
    };
  }

  public getTelephonyDomains(customerId: string) {
    let url = this.url.getTelephonyDomains + customerId;
    return this.$http.get(url, {}).then((response) => {
      return _.get(response, 'data');
    });
  }
}
