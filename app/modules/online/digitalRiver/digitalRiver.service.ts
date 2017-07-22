export class DigitalRiverService {
  private readonly DIGITAL_RIVER_URL = {
    spark: 'https://buy.ciscospark.com/store/ciscoctg/en_US/',
    webex: 'https://buy.webex.com/store/ciscoctg/en_US/',
    dr: 'https://gc.digitalriver.com/store/ciscoctg/',
  };

  private readonly DIGITAL_RIVER_COOKIE = 'webexToken';
  private readonly WEBEX_ENVIRONMENT = 'webex';

  /* @ngInject */
  constructor(
    private $document: ng.IDocumentService,
    private $http: ng.IHttpService,
    private $sce: ng.ISCEService,
    private UrlConfig,
  ) {}

  public getOrderHistoryUrl(env: string): ng.IPromise<string> {
    const ORDER_HISTORY_PATH = 'DisplayAccountOrderListPage?';
    return this.getDigitalRiverUrl(ORDER_HISTORY_PATH, env);
  }

  public getSubscriptionsUrl(env: string): ng.IPromise<string> {
    const SUBSCRIPTIONS_PATH = 'DisplaySelfServiceSubscriptionHistoryListPage?';
    return this.getDigitalRiverUrl(SUBSCRIPTIONS_PATH, env);
  }

  public getInvoiceUrl(reqId: string, product: string): ng.IPromise<string> {
    let invoicePath = 'DisplayInvoicePage?requisitionID=' + reqId + '&';
    if (_.includes(product, 'WebEx')) {
      invoicePath += 'ThemeID=4777108300&';
    }
    return this.getDigitalRiverUrl(invoicePath, 'dr');
  }

  public logout(env: string): ng.IHttpPromise<any> {
    return this.$http.jsonp(this.$sce.trustAsResourceUrl(`${_.get(this.DIGITAL_RIVER_URL, env)}remoteLogout`));
  }

  public getDigitalRiverToken(): ng.IPromise<string> {
    return this.$http.get<string>(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken')
      .then(response => response.data as string)
      .then(authToken => this.setDRCookie(authToken));
  }

  public getDigitalRiverUpgradeTrialUrl(subId: string): ng.IPromise<any> {
    return this.$http.get(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/' + subId);
  }

  private getDigitalRiverUrl(path: string, env: string): ng.IPromise<string> {
    return this.getDigitalRiverToken()
      .then((response) => {
        const queryParams = env === this.WEBEX_ENVIRONMENT ? 'ThemeID=4777108300&DRL=' : 'DRL=';
        return _.get(this.DIGITAL_RIVER_URL, env) + path + queryParams + encodeURIComponent(response);
      });
  }

  private setDRCookie(authToken: string) {
    this.$document.prop('cookie', `${this.DIGITAL_RIVER_COOKIE}=${authToken};domain=ciscospark.com;secure`);
    return authToken;
  }
}
