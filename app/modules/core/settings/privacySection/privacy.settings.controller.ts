namespace globalsettings {
  export class PrivacySettingController {
    private _allowReadOnlyAccess:boolean = undefined;
    sendUsageData:boolean = undefined;
    showAllowReadOnlyAccessCheckbox:boolean = true;
    private orgId;
    private _allowCrashLogUpload = false;

    /* @ngInject */
    constructor(private Orgservice, Authinfo, private Notification) {
      this.orgId = Authinfo.getOrgId();

      Orgservice.getOrg((data)=> {
        this.orgDataLoaded(data)
      }, this.orgId, false);
    }

    orgDataLoaded({success:success = false, orgSettings:settings = undefined}={
      success: false,
      orgSettings: undefined
    }) {
      if (success) {
        if (!_.isUndefined(settings.allowReadOnlyAccess)) {
          this._allowReadOnlyAccess = settings.allowReadOnlyAccess;
        }

        if (!_.isUndefined(settings.allowCrashLogUpload)) {
          this._allowCrashLogUpload = settings.allowCrashLogUpload;
        } else {
          this._allowCrashLogUpload = false;
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

    get allowCrashLogUpload():boolean {
      return this._allowCrashLogUpload;
    }

    set allowCrashLogUpload(value:boolean) {
      this._allowCrashLogUpload = value;
      this.updateAllowCrashLogUpload();
    }

    updateAllowReadOnlyOrgAccess() {
      let settings = {
        allowReadOnlyAccess: this.allowReadOnlyAccess,
      };
      this.updateOrgSettings(this.orgId, settings);
    }

    updateAllowCrashLogUpload() {
      let settings = {
        allowCrashLogUpload: this.allowCrashLogUpload,
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
