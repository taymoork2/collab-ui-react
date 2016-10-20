namespace globalsettings {

  interface IGetAppSecurityResponse {
    clientSecurityPolicy: boolean;
  }
  export class SecuritySettingController {

    private _isSparkClientSecurityEnabled: boolean;
    public isSparkClientSecurityLoaded: boolean = false;

    private orgId: string;

    /* @ngInject */
    constructor(
      private Notification,
      private AccountOrgService,
      private Authinfo,
    ) {
      this.orgId = this.Authinfo.getOrgId();
      this.loadSetting();
    }

    private loadSetting() {
      this.AccountOrgService.getAppSecurity(this.orgId)
        .then((response) => this.appSecuritySettingLoaded(response));
    }

    private appSecuritySettingLoaded(response: ng.IHttpPromiseCallbackArg<IGetAppSecurityResponse>) {
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
  angular.module('Core')
    .controller('SecuritySettingController', SecuritySettingController);
}
