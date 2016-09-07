const DIGITAL_RIVER_URL = 'https://drhadmin-cte.digitalriver.com/store/ciscoctg/en_US/';

export class DigitalRiverService {

  /* @ngInject */
  constructor(
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

  public getLogoutUrl(): string {
    return DIGITAL_RIVER_URL + 'Logout';
  }

  private getDigitalRiverUrl(path: string): ng.IPromise<string> {
    return this.getEncodedDigitalRiverToken()
      .then((response) => {
        return DIGITAL_RIVER_URL + path + '?DRL=' + response;
      });
  }

  private getEncodedDigitalRiverToken(): ng.IPromise<string> {
    return this.$http.get<string>(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken')
      .then((response) => {
          return encodeURIComponent(response.data);
      });
  }
}
