namespace globalsettings {
  export class PrivacySettingController {
    private _allowReadOnlyAccess: boolean;
    public disableAllowReadOnlyAccessCheckbox: boolean = true;
    private orgId;
    private _allowCrashLogUpload = false;

    /* @ngInject */
    constructor(private Orgservice, Authinfo, private Notification) {
      this.orgId = Authinfo.getOrgId();

      Orgservice.getOrg((data) => {
        this.orgDataLoaded(data);
      }, this.orgId, false);
    }

    public orgDataLoaded({ success = false, orgSettings = undefined }: { success: boolean; orgSettings: any } = {
      success: false,
      orgSettings: undefined,
    }) {
      if (success) {
        this.disableAllowReadOnlyAccessCheckbox = false;

        if (!_.isUndefined(orgSettings.allowReadOnlyAccess)) {
          this._allowReadOnlyAccess = orgSettings.allowReadOnlyAccess;
        } else {
          this._allowReadOnlyAccess = true;
        }

        if (!_.isUndefined(orgSettings.allowCrashLogUpload)) {
          this._allowCrashLogUpload = orgSettings.allowCrashLogUpload;
        } else {
          this._allowCrashLogUpload = false;
        }
      }
    }

    get allowReadOnlyAccess(): boolean {
      return this._allowReadOnlyAccess;
    }

    set allowReadOnlyAccess(value: boolean) {
      this._allowReadOnlyAccess = value;
      this.updateAllowReadOnlyOrgAccess();
    }

    get allowCrashLogUpload(): boolean {
      return this._allowCrashLogUpload;
    }

    set allowCrashLogUpload(value: boolean) {
      this._allowCrashLogUpload = value;
      this.updateAllowCrashLogUpload();
    }

    public updateAllowReadOnlyOrgAccess() {
      let settings = {
        allowReadOnlyAccess: this.allowReadOnlyAccess,
      };
      this.updateOrgSettings(this.orgId, settings);
    }

    public updateAllowCrashLogUpload() {
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
        status: response.status,
      });
    }

    private stopLoading() {

    }
  }
  angular.module('Core')
    .controller('PrivacySettingController', PrivacySettingController);
}
