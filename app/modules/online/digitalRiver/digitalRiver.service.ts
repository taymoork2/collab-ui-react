const DIGITAL_RIVER_URL = 'https://buy.ciscospark.com/store/ciscoctg/en_US/';
const DIGITAL_RIVER_COOKIE = 'webexToken';

export class DigitalRiverService {

  /* @ngInject */
  constructor(
    private $document: ng.IDocumentService,
    private $http: ng.IHttpService,
    private UrlConfig
  ) {}

  public getOrderHistoryUrl(): ng.IPromise<string> {
    const ORDER_HISTORY_PATH = 'DisplayAccountOrderListPage';
    return this.getDigitalRiverUrl(ORDER_HISTORY_PATH);
  }

  public getSubscriptionsUrl(): ng.IPromise<string> {
    const SUBSCRIPTIONS_PATH = 'DisplaySelfServiceSubscriptionHistoryListPage';
    return this.getDigitalRiverUrl(SUBSCRIPTIONS_PATH);
  }

  public logout(): ng.IHttpPromise<any> {
    return this.$http.jsonp(DIGITAL_RIVER_URL + 'remoteLogout?callback=JSON_CALLBACK');
  }

  private getDigitalRiverUrl(path: string): ng.IPromise<string> {
    return this.getDigitalRiverToken()
      .then((response) => this.setDRCookie(response))
      .then((response) => {
        return DIGITAL_RIVER_URL + path + '?DRL=' + encodeURIComponent(response);
      });
  }

  private setDRCookie(authToken: string) {
    this.$document.prop('cookie', DIGITAL_RIVER_COOKIE + '=' + authToken + ';domain=ciscospark.com;secure');
    return authToken;
  }

  private getDigitalRiverToken(): ng.IPromise<string> {
    return this.$http.get<string>(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken')
      .then((response) => response.data);
  }
}
