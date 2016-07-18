namespace globalsettings {

  interface GetAppSecurityResponse {
    data:{
      clientSecurityPolicy:boolean
    }
  }
  export class SecuritySettingController {

    public requireProtectedDevices:boolean = undefined;
    public requireProtectedDevicesIsLoaded:boolean = false;

    private orgId:string;

    /* @ngInject */
    constructor(private Notification, private $translate, private AccountOrgService, Authinfo) {
      this.orgId = Authinfo.getOrgId();
      this.loadSetting();
    }

    private loadSetting() {
      this.AccountOrgService.getAppSecurity(this.orgId)
        .then(this.appSecuritySettingLoaded.bind(this));
    }

    private appSecuritySettingLoaded({data:{clientSecurityPolicy:clientSecurityPolicy}={clientSecurityPolicy: null}}:GetAppSecurityResponse) {
      if (clientSecurityPolicy != null) {
        this.requireProtectedDevices = clientSecurityPolicy;
        this.requireProtectedDevicesIsLoaded = true;
      }
    }

    requireProtectedDevicesUpdate() {
      if (this.requireProtectedDevices != undefined) {

        // Calls AppSecuritySetting service to update device security enforcement
        this.AccountOrgService.setAppSecurity(this.orgId, this.requireProtectedDevices)
          .then((response) => {
            this.Notification.notify([this.$translate.instant('firstTimeWizard.messengerAppSecuritySuccess')], 'success');
          })
          .catch((response) => {
            this.Notification.notify([this.$translate.instant('firstTimeWizard.messengerAppSecurityError')], 'error');
          });
      }
    }
  }
  angular.module('Core')
    .controller('SecuritySettingController', SecuritySettingController);
}
