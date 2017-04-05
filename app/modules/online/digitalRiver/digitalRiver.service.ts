const DIGITAL_RIVER_URL = {
  spark: 'https://buy.ciscospark.com/store/ciscoctg/en_US/',
  webex: 'https://buy.webex.com/store/ciscoctg/en_US/',
};

const DIGITAL_RIVER_COOKIE = 'webexToken';
const WEBEX_ENVIRONMENT = 'webex';

export class DigitalRiverService {

  /* @ngInject */
  constructor(
    private $document: ng.IDocumentService,
    private $http: ng.IHttpService,
    private UrlConfig,
  ) {}

  public getOrderHistoryUrl(env: string): ng.IPromise<string> {
    const ORDER_HISTORY_PATH = 'DisplayAccountOrderListPage';
    return this.getDigitalRiverUrl(ORDER_HISTORY_PATH, env);
  }

  public getSubscriptionsUrl(env: string): ng.IPromise<string> {
    const SUBSCRIPTIONS_PATH = 'DisplaySelfServiceSubscriptionHistoryListPage';
    return this.getDigitalRiverUrl(SUBSCRIPTIONS_PATH, env);
  }

  public logout(env: string): ng.IHttpPromise<any> {
    return this.$http.jsonp(_.get(DIGITAL_RIVER_URL, env) + 'remoteLogout?callback=JSON_CALLBACK');
  }

  private getDigitalRiverUrl(path: string, env: string): ng.IPromise<string> {
    return this.getDigitalRiverToken()
      .then((response) => this.setDRCookie(response))
      .then((response) => {
        const queryParams = env === WEBEX_ENVIRONMENT ? '?ThemeID=4777108300&DRL=' : '?DRL=';
        return _.get(DIGITAL_RIVER_URL, env) + path + queryParams + encodeURIComponent(response);
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
