import { Config } from 'modules/core/config/config';
export class DigitalRiverService {
  private readonly DIGITAL_RIVER_URL = {
    store: 'https://buy.ciscospark.com/store/ciscoctg/en_US/',
    billing: 'https://buy.ciscospark.com/DRHM/store?Action=DisplayAddEditPaymentPage&SiteID=ciscoctg&ThemeID=4805888100&',
  };

  private readonly DIGITAL_RIVER_COOKIE = 'webexToken';

  /* @ngInject */
  constructor(
    private $document: ng.IDocumentService,
    private $http: ng.IHttpService,
    private $sce: ng.ISCEService,
    private Config: Config,
    private UrlConfig,
  ) {}

  public getSubscriptionsUrl(): ng.IPromise<string> {
    const subscriptionsPath = 'DisplaySelfServiceSubscriptionHistoryListPage?';
    return this.getDigitalRiverUrl(subscriptionsPath, 'store');
  }

  public getBillingUrl(): ng.IPromise<string> {
    return this.getDigitalRiverUrl('', 'billing');
  }

  public getInvoiceUrl(reqId: string, product: string): ng.IPromise<string> {
    let invoicePath = 'DisplayInvoicePage?requisitionID=' + reqId + '&';
    if (_.includes(product, this.Config.onlineProducts.webex)) {
      invoicePath += 'ThemeID=4777108300&';
    }
    return this.getDigitalRiverUrl(invoicePath, 'store');
  }

  public logout(env: string): ng.IHttpPromise<any> {
    return this.$http.jsonp(this.$sce.trustAsResourceUrl(`${_.get(this.DIGITAL_RIVER_URL, env)}remoteLogout`));
  }

  public getDigitalRiverToken(): ng.IPromise<string> {
    return this.$http.get<string>(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken')
      .then(response => response.data)
      .then(authToken => this.setDRCookie(authToken));
  }

  public getDigitalRiverUpgradeTrialUrl(subId: string): ng.IPromise<any> {
    return this.$http.get(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/' + subId);
  }

  private getDigitalRiverUrl(path: string, env: string): ng.IPromise<string> {
    return this.getDigitalRiverToken()
      .then((response) => {
        const queryParams = 'DRL=';
        return _.get(this.DIGITAL_RIVER_URL, env) + path + queryParams + encodeURIComponent(response);
      });
  }

  private setDRCookie(authToken: string) {
    this.$document.prop('cookie', `${this.DIGITAL_RIVER_COOKIE}=${authToken};domain=ciscospark.com;secure`);
    return authToken;
  }
}
