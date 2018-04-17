
interface IGetAppSecurityResponse {
  clientSecurityPolicy: boolean;
}

export class SecuritySettingController {

  private _isSparkClientSecurityEnabled: boolean;
  public isSparkClientSecurityLoaded: boolean = false;
  public isProPackPurchased: boolean = false;

  private orgId: string;

  /* @ngInject */
  constructor(
    private $q,
    private AccountOrgService,
    private Authinfo,
    private ProPackService,
    private Notification,
  ) {
    this.orgId = this.Authinfo.getOrgId();
    this.loadSetting();
  }

  private loadSetting() {
    const promises = {
      security: this.AccountOrgService.getAppSecurity(this.orgId),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises)
      .then((response) => {
        this.appSecuritySettingLoaded(response.security);
        this.isProPackPurchased = response.proPackPurchased;
      }).catch(_.noop);
  }

  private appSecuritySettingLoaded(response: ng.IHttpResponse<IGetAppSecurityResponse>) {
    if (_.has(response, 'data.clientSecurityPolicy')) {
      this._isSparkClientSecurityEnabled = _.get<boolean>(response, 'data.clientSecurityPolicy');
      this.isSparkClientSecurityLoaded = true;
    }
  }

  get isSparkClientSecurityEnabled(): boolean {
    return this._isSparkClientSecurityEnabled;
  }

  set isSparkClientSecurityEnabled(value: boolean) {
    this._isSparkClientSecurityEnabled = value;
    this.updateSparkClientSecuritySetting();
  }

  public updateSparkClientSecuritySetting() {
    if (this._isSparkClientSecurityEnabled !== undefined) {
      // Calls AppSecuritySetting service to update device security enforcement
      this.AccountOrgService.setAppSecurity(this.orgId, this._isSparkClientSecurityEnabled)
        .then(() => {
          this.Notification.success('firstTimeWizard.messengerAppSecuritySuccess');
        })
        .catch((response) => {
          this.Notification.errorWithTrackingId(response, 'firstTimeWizard.messengerAppSecurityError');
        });
    }
  }
}
