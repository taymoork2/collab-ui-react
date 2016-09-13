declare const _satellite;

export class OnlineAnalyticsService {
  public MY_COMPANY_INFO = 'atlas-spark-myaccount-info';
  public MY_COMPANY_ORDER_HISTORY = 'atlas-spark-myaccount-orderhistory';
  public MY_COMPANY_SUBSCRIPTIONS = 'atlas-spark-myaccount-subscriptions';

  /* @ngInject */
  constructor(
    private Authinfo,
    private Config
  ) {}

  public track(event: string): void {
    this._track(event);
  }

  private _track(event: string): void {
    if (typeof _satellite !== 'undefined' && this.Authinfo.isOnline() && !this.Config.isDev()) {
      _satellite.track(event);
    }
  }
}