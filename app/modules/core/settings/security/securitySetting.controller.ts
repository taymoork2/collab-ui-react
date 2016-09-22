namespace globalsettings {

  interface IGetAppSecurityResponse {
    clientSecurityPolicy: boolean;
  }
  export class SecuritySettingController {

    private _isSparkClientSecurityEnabled: boolean = undefined;
    public isSparkClientSecurityLoaded: boolean = false;

    private orgId: string;

    /* @ngInject */
    constructor(private Notification, private AccountOrgService, Authinfo) {
      this.orgId = Authinfo.getOrgId();
      this.loadSetting();
    }

    private loadSetting() {
      this.AccountOrgService.getAppSecurity(this.orgId)
        .then((response) => this.appSecuritySettingLoaded(response));
    }

    private appSecuritySettingLoaded(response: ng.IHttpPromiseCallbackArg<IGetAppSecurityResponse>) {
      if (_.has(response, 'data.clientSecurityPolicy')) {
        this._isSparkClientSecurityEnabled = response.data.clientSecurityPolicy;
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
          .then((response) => {
            this.Notification.success('firstTimeWizard.messengerAppSecuritySuccess');
          })
          .catch((response) => {
            this.Notification.error('firstTimeWizard.messengerAppSecurityError');
          });
      }
    }
  }
  angular.module('Core')
    .controller('SecuritySettingController', SecuritySettingController);
}
