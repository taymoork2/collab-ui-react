namespace globalsettings {
  export class SupportSettings {
    private _useCustomSupportUrl = false;

    private oldUseCustomSupportUrl = false;
    private _useCustomHelpSite = false;
    private oldUseCustomHelpSite = false;
    private supportUrl;
    private supportText;
    private oldSupportUrl;
    private oldSupportText;
    private helpUrl;
    private oldHelpUrl;
    private isCiscoSupport = false;
    private isCiscoHelp = false;

    private orgId;

    private problemSiteInfo = {
      cisco: false,
      ext: true
    };

    private helpSiteInfo = {
      cisco: false,
      ext: true
    };
    private grant;
    private troubleUrl;
    private troubleText;
    private helpUrlText;
    private partnerProvidedText;
    public orgProfileSaveLoad = false;
    private isManaged = false;


    get useCustomHelpSite() {
      return this._useCustomHelpSite;
    }

    set useCustomHelpSite(value) {
      this._useCustomHelpSite = value;
      if (value === this.helpSiteInfo.cisco) {
        this.helpUrl = '';
      }
    }

    get useCustomHelpSiteDirty() {
      return this._useCustomHelpSite != this.oldUseCustomHelpSite || (this._useCustomHelpSite && this.helpUrl != this.oldHelpUrl);
    }

    get useCustomSupportUrl() {
      return this._useCustomSupportUrl;
    }

    set useCustomSupportUrl(value) {
      this._useCustomSupportUrl = value;
      if (value === this.problemSiteInfo.cisco) {
        this.supportUrl = '';
        this.supportText = '';
      }
    }

    get useCustomSupportUrlDirty():boolean {
      return this._useCustomSupportUrl != this.oldUseCustomSupportUrl || ( this._useCustomSupportUrl && (this.supportUrl != this.oldSupportUrl || this.oldSupportText != this.supportText));
    }

    get isPartner():boolean {
      return this.Authinfo.isPartner();
    }

    static get appType():string {
      return 'Squared';
    }


    /* @ngInject */
    constructor(private Authinfo, private Orgservice, private Notification, $translate, private UserListService) {

      this.orgId = Authinfo.getOrgId();


      this.initTexts($translate);
      this.initOrgInfo();
    }


    private initTexts($translate) {
      this.grant = $translate.instant('partnerProfile.grant');
      this.troubleUrl = $translate.instant('partnerProfile.troubleUrl');
      this.troubleText = $translate.instant('partnerProfile.troubleText');
      this.helpUrlText = $translate.instant('partnerProfile.helpUrlText');
      this.partnerProvidedText = $translate.instant('partnerProfile.partnerProvidedText');
    }


    private initOrgInfo() {

      this.UserListService.listPartners(this.orgId, function (data) {
        for (var partner in data.partners) {
          var currentPartner = data.partners[partner];
          if (!this.isPartner && currentPartner.userName.indexOf('@cisco.com') === -1) {
            this.partner = currentPartner;
            this.isManaged = true;
          } else if (currentPartner.userName.indexOf('@cisco.com') > -1) {
            this.rep = currentPartner;
            this.isManaged = true;
          }
        }
      });

      this.Orgservice.getOrg((data, status) => {
        if (data.success) {
          let settings = data.orgSettings;
          console.log(settings);

          if (!_.isEmpty(settings.reportingSiteUrl)) {
            this._useCustomSupportUrl = true;
            this.oldUseCustomSupportUrl = true;
            this.supportUrl = settings.reportingSiteUrl;
            this.oldSupportUrl = this.supportUrl;
          }

          if (!_.isEmpty(settings.reportingSiteDesc)) {
            this._useCustomSupportUrl = true;
            this.oldUseCustomSupportUrl = true;
            this.supportText = settings.reportingSiteDesc;
            this.oldSupportText = this.supportText;
          }

          if (!_.isEmpty(settings.helpUrl)) {
            this._useCustomHelpSite = true;
            this.oldUseCustomHelpSite = true;
            this.helpUrl = settings.helpUrl;
            this.oldHelpUrl = this.helpUrl;
          }

          if (!_.isUndefined(settings.isCiscoSupport)) {
            this.isCiscoSupport = settings.isCiscoSupport;
          }

          if (!_.isUndefined(settings.isCiscoHelp)) {
            this.isCiscoHelp = settings.isCiscoHelp;
          }


          // this.resetForm();
        } else {
          // Log.debug('Get existing org failed. Status: ' + status);
        }

      }, this.orgId, true);
    }

    public saveUseCustomSupportUrl() {
      if (this.customSupportUrlIsValid()) {
        let isCiscoHelp = this.isManaged ? this.isCiscoHelp : this.useCustomHelpSite === false;
        let isCiscoSupport = this.isManaged ? this.isCiscoSupport : this.useCustomSupportUrl === false;
        var settings = {
          reportingSiteUrl: this.supportUrl || null,
          reportingSiteDesc: this.supportText || null,
          // helpUrl: this.helpUrl || null,
          // isCiscoHelp: isCiscoHelp,
          isCiscoSupport: isCiscoSupport,
          // allowReadOnlyAccess: this.allowReadOnlyAccess,
          // allowCrashLogUpload: this.allowCrashLogUpload
        };
        this.updateOrgSettings(this.orgId, settings, ()=> {
          this.resetCustomSupportUrlForm();
        });
      }
      else {
        this.Notification.error('partnerProfile.orgSettingsError');
      }
    }

    private resetCustomSupportUrlForm() {
      this.oldUseCustomSupportUrl = this.useCustomSupportUrl;
      this.oldSupportUrl = this.supportUrl;
      this.oldSupportText = this.supportText;
    }

    public saveUseCustomHelpSite() {
      if (this.customHelpSiteIsValid()) {
        let isCiscoHelp = this.isManaged ? this.isCiscoHelp : this.useCustomHelpSite === false;
        // var isCiscoSupport = this.isManaged ? this.isCiscoSupport : this.useCustomSupportUrl;
        let settings = {
          // reportingSiteUrl: this.supportUrl || null,
          // reportingSiteDesc: this.supportText || null,
          helpUrl: this.helpUrl || null,
          isCiscoHelp: isCiscoHelp,
          // isCiscoSupport: isCiscoSupport,
          // allowReadOnlyAccess: this.allowReadOnlyAccess,
          // allowCrashLogUpload: this.allowCrashLogUpload
        };

        this.updateOrgSettings(this.orgId, settings, ()=> {
          this.resetCustomHelpSiteForm();
        });
      } else {
        this.Notification.error('partnerProfile.orgSettingsError');
      }
    }

    private resetCustomHelpSiteForm() {
      this.oldHelpUrl = this.helpUrl;
      this.oldUseCustomHelpSite = this.useCustomHelpSite;
    }

    private customSupportUrlIsValid() {
      // if user is attempting to use a blank support url
      return !(this.supportUrl === '' && this.useCustomSupportUrl !== this.problemSiteInfo.cisco);
    }

    private customHelpSiteIsValid() {
      // if user is attempting to use a blank help url
      return !(this.helpUrl === '' && this.useCustomHelpSite !== this.helpSiteInfo.cisco);
    }

    private updateOrgSettings(orgId, settings, onSuccess) {
      this.orgProfileSaveLoad = true;
      this.Orgservice.setOrgSettings(orgId, settings)
        .then(onSuccess)
        .then(this.notifySuccess.bind(this))
        // .then(this.resetForm)
        .catch(this.notifyError.bind(this))
        .finally(this.stopLoading.bind(this));
    }

    stopLoading() {
      this.orgProfileSaveLoad = false;
    }

    private notifySuccess() {
      this.Notification.success('partnerProfile.processing');
    }

    private notifyError(response) {
      this.Notification.errorResponse(response, 'errors.statusError', {
        status: response.status
      });
    }

  }
  angular
    .module('Core')
    .controller('SupportSettings', SupportSettings);
}
