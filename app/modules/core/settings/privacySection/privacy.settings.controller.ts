namespace globalsettings {
  export class PrivacySettingController {

    private _allowReadOnlyAccess:boolean = undefined;
    sendUsageData:boolean = undefined;
    showAllowReadOnlyAccessCheckbox:boolean = true;
    private orgId;

    /* @ngInject */
    constructor(private Orgservice, Authinfo, private Notification) {
      this.orgId = Authinfo.getOrgId();
      //get the current setting:
      // setTimeout(this.sendUsageDataLoaded.bind(this), 1200, false);

      Orgservice.getOrg((data)=> {
        this.orgDataLoaded(data)
      }, this.orgId, false);
    }

    orgDataLoaded({success:success = false, orgSettings:settings = undefined}={success: false, orgSettings: undefined}) {
      if (success) {
        if (!_.isUndefined(settings.allowReadOnlyAccess)) {
          this._allowReadOnlyAccess = settings.allowReadOnlyAccess;
        }
      }
    }

    get allowReadOnlyAccess():boolean {
      return this._allowReadOnlyAccess;
    }

    set allowReadOnlyAccess(value:boolean) {
      this._allowReadOnlyAccess = value;
      this.updateAllowReadOnlyOrgAccess();
    }


    updateAllowReadOnlyOrgAccess() {
      let settings = {
        allowReadOnlyAccess: this.allowReadOnlyAccess,
      };
      this.updateOrgSettings(this.orgId, settings);
    }

    private updateOrgSettings(orgId, settings) {

      this.Orgservice.setOrgSettings(orgId, settings)
        .then()
        .catch(this.notifyError.bind(this))
        .finally(this.stopLoading.bind(this));
    }

    private notifyError(response) {
      this.Notification.errorResponse(response, 'errors.statusError', {
        status: response.status
      });
    }

    private stopLoading() {

    }
  }
  angular.module('Core')
    .controller('PrivacySettingController', PrivacySettingController);
}
