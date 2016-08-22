export class DigitalRiverService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private UrlConfig
  ) {}

  public getDigitalRiverOrderHistoryUrl(): ng.IPromise<string> {
    const ORDER_HISTORY_PATH = 'DisplayAccountOrderListPage';
    return this.getDigitalRiverUrl(ORDER_HISTORY_PATH);
  }

  public getDigitalRiverSubscriptionsUrl(): ng.IPromise<string> {
    const SUBSCRIPTIONS_PATH = 'DisplaySelfServiceSubscriptionHistoryListPage';
    return this.getDigitalRiverUrl(SUBSCRIPTIONS_PATH);
  }

  private getDigitalRiverUrl(path: string): ng.IPromise<string> {
    const DIGITAL_RIVER_URL = 'https://store.digitalriver.com/store/ciscoctg/en_US/';
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

angular
  .module('Core')
  .service('DigitalRiverService', DigitalRiverService);
