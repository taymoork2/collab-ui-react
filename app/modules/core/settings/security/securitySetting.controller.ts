namespace globalsettings {

  interface GetAppSecurityResponse {
    data:{
      clientSecurityPolicy:boolean
    }
  }
  export class SecuritySettingController {

    private _requireProtectedDevices:boolean = undefined;
    requireProtectedDevicesIsLoaded:boolean = false;

    private orgId:string;

    /* @ngInject */
    constructor(private Notification, private AccountOrgService, Authinfo) {
      this.orgId = Authinfo.getOrgId();
      this.loadSetting();
    }

    private loadSetting() {
      this.AccountOrgService.getAppSecurity(this.orgId)
        .then(this.appSecuritySettingLoaded.bind(this));
    }

    private appSecuritySettingLoaded({data:{clientSecurityPolicy:clientSecurityPolicy}={clientSecurityPolicy: null}}:GetAppSecurityResponse) {
      if (clientSecurityPolicy != null) {
        this._requireProtectedDevices = clientSecurityPolicy;
        this.requireProtectedDevicesIsLoaded = true;
      }
    }

    get requireProtectedDevices():boolean {
      return this._requireProtectedDevices;
    }

    set requireProtectedDevices(value:boolean) {
      this._requireProtectedDevices = value;
      this.updateRequireProtectedDevices();
    }

    updateRequireProtectedDevices() {
      var requireProtectedDevices = this._requireProtectedDevices;
      if (requireProtectedDevices != undefined) {
        // Calls AppSecuritySetting service to update device security enforcement
        this.AccountOrgService.setAppSecurity(this.orgId, requireProtectedDevices)
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
