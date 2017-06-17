import { Notification } from 'modules/core/notifications';

export class SupportSettingsController {
  private proPackEnabled: boolean = false;
  public nameChangeEnabled: boolean = false;

  private customSupport = { enable: false, url: '', text: '' };
  private oldCustomSupport = { enable: false, url: '', text: '' };

  private customHelpSite = { enable: false, url: '' };
  private oldCustomHelpSite = { enable: false, url: '' };

  public placeHolder = {};
  private isCiscoSupport = false;
  private isCiscoHelp = false;

  private orgId;

  private problemSiteInfo = {
    cisco: false,
    ext: true,
  };

  private helpSiteInfo = {
    cisco: false,
    ext: true,
  };

  public savingProgress = false;

  private partners;
  private representatives;

  public get isManaged() {
    return _.some(this.representatives) || _.some(this.partners);
  }

  get useCustomHelpSite() {
    return this.customHelpSite.enable;
  }

  set useCustomHelpSite(value: boolean) {
    this.customHelpSite.enable = value;
    if (value === this.helpSiteInfo.cisco) {
      this.customHelpSite.url = '';
    }
  }

  get showCustomHelpSiteSaveButton() {
    return this.customHelpSite.enable !== this.oldCustomHelpSite.enable //Switched
      && (!this.customHelpSite.enable || this.customHelpSite.url) //to disabled or has an url set
      || (this.customHelpSite.enable && this.customHelpSite.url && this.customHelpSite.url !== this.oldCustomHelpSite.url); //or enabled with a new url set
  }

  get useCustomSupportUrl() {
    return this.customSupport.enable;
  }

  set useCustomSupportUrl(value: boolean) {
    this.customSupport.enable = value;
    if (value === this.problemSiteInfo.cisco) {
      this.customSupport.url = '';
      this.customSupport.text = '';
    }
  }

  get showCustomSupportUrlSaveButton(): boolean {
    return this.customSupport.enable !== this.oldCustomSupport.enable //Switched
      && (!this.customSupport.enable || !!this.customSupport.url) //to disabled or has an url set
      || ( this.customSupport.enable && !!this.customSupport.url && (this.customSupport.url !== this.oldCustomSupport.url || this.oldCustomSupport.text !== this.customSupport.text));
  }

  get isPartner(): boolean {
    return this.Authinfo.isPartner();
  }

  public static get appType(): string {
    return 'Squared';
  }

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private Authinfo,
    private FeatureToggleService,
    private ITProPackService,
    private Log,
    private Notification: Notification,
    private Orgservice,
    private UserListService,
  ) {
    this.$q.all({
      proPackEnabled: this.ITProPackService.hasITProPackPurchased(),
      nameChangeEnabled: this.FeatureToggleService.atlas2017NameChangeGetStatus(),
    }).then((toggles: any): void => {
      this.proPackEnabled = toggles.proPackEnabled;
      this.nameChangeEnabled = toggles.nameChangeEnabled;
    });

    this.orgId = Authinfo.getOrgId();
    this.initTexts();
    this.initOrgInfo();
  }

  private initTexts() {
    this.placeHolder = {
      troubleUrl: this.$translate.instant('partnerProfile.troubleUrl'),
      troubleText: this.$translate.instant('partnerProfile.troubleText'),
      helpUrlText: this.$translate.instant('partnerProfile.helpUrlText'),
    };
  }

  private initOrgInfo() {
    this.UserListService.listPartners(this.orgId, (data: { partners: Partner[] }) => {
      if (_.isEmpty(data.partners)) {
        return;
      }
      this.representatives = _.filter(data.partners, (rep) => {
        return _.endsWith(rep.userName, '@cisco.com');
      });
      this.partners = _.filter(data.partners, (rep) => {
        return !_.endsWith(rep.userName, '@cisco.com');
      });
    });

    const params = {
      basicInfo: true,
      disableCache: true,
    };
    this.Orgservice.getOrg((data, status) => {
      if (data.success) {
        const settings = data.orgSettings;

        if (!_.isEmpty(settings.reportingSiteUrl)) {
          this.customSupport.enable = true;
          this.oldCustomSupport.enable = true;
          this.customSupport.url = settings.reportingSiteUrl;
          this.oldCustomSupport.url = this.customSupport.url;
        }

        if (!_.isEmpty(settings.reportingSiteDesc)) {
          this.customSupport.enable = true;
          this.oldCustomSupport.enable = true;
          this.customSupport.text = settings.reportingSiteDesc;
          this.oldCustomSupport.text = this.customSupport.text;
        }

        if (!_.isEmpty(settings.helpUrl)) {
          this.customHelpSite.enable = true;
          this.oldCustomHelpSite.enable = true;
          this.customHelpSite.url = settings.helpUrl;
          this.oldCustomHelpSite.url = this.customHelpSite.url;
        }

        if (!_.isUndefined(settings.isCiscoSupport)) {
          this.isCiscoSupport = settings.isCiscoSupport;
        }

        if (!_.isUndefined(settings.isCiscoHelp)) {
          this.isCiscoHelp = settings.isCiscoHelp;
        }

      } else {
        this.Log.debug('Get existing org failed. Status: ' + status);
      }

    }, this.orgId, params);
  }

  public saveUseCustomSupportUrl() {
    if (this.customSupportUrlIsValid()) {
      // let isCiscoHelp = this.isManaged ? this.isCiscoHelp : this.useCustomHelpSite === false;
      const isCiscoSupport = this.isManaged ? this.isCiscoSupport : this.useCustomSupportUrl === false;
      const settings = {
        reportingSiteUrl: this.customSupport.url || null,
        reportingSiteDesc: this.customSupport.text || null,
        // helpUrl: this.helpUrl || null,
        // isCiscoHelp: isCiscoHelp,
        isCiscoSupport: isCiscoSupport,
        // allowReadOnlyAccess: this.allowReadOnlyAccess,
        // allowCrashLogUpload: this.allowCrashLogUpload
      };
      this.updateOrgSettings(this.orgId, settings, () => {
        this.resetCustomSupportUrlForm();
      });
    } else {
      this.Notification.error('partnerProfile.orgSettingsError');
    }
  }

  private resetCustomSupportUrlForm() {
    this.oldCustomSupport.enable = this.useCustomSupportUrl;
    this.oldCustomSupport.url = this.customSupport.url;
    this.oldCustomSupport.text = this.customSupport.text;
  }

  public saveUseCustomHelpSite() {
    if (this.customHelpSiteIsValid()) {
      const isCiscoHelp = this.isManaged ? this.isCiscoHelp : this.useCustomHelpSite === false;
      // var isCiscoSupport = this.isManaged ? this.isCiscoSupport : this.useCustomSupportUrl;
      const settings = {
        // reportingSiteUrl: this.supportUrl || null,
        // reportingSiteDesc: this.supportText || null,
        helpUrl: this.customHelpSite.url || null,
        isCiscoHelp: isCiscoHelp,
        // isCiscoSupport: isCiscoSupport,
        // allowReadOnlyAccess: this.allowReadOnlyAccess,
        // allowCrashLogUpload: this.allowCrashLogUpload
      };

      this.updateOrgSettings(this.orgId, settings, () => {
        this.resetCustomHelpSiteForm();
      });
    } else {
      this.Notification.error('partnerProfile.orgSettingsError');
    }
  }

  public getAppTitle(): string {
    return this.proPackEnabled ? this.$translate.instant('loginPage.titlePro') : this.$translate.instant('loginPage.titleNew');
  }

  private resetCustomHelpSiteForm() {
    this.oldCustomHelpSite.url = this.customHelpSite.url;
    this.oldCustomHelpSite.enable = this.useCustomHelpSite;
  }

  private customSupportUrlIsValid() {
    // if user is attempting to use a blank support url
    return !(this.customSupport.url === '' && this.customSupport.enable !== this.problemSiteInfo.cisco);
  }

  private customHelpSiteIsValid() {
    // if user is attempting to use a blank help url
    return !(this.customHelpSite.url === '' && this.useCustomHelpSite !== this.helpSiteInfo.cisco);
  }

  private updateOrgSettings(orgId, settings, onSuccess) {
    this.savingProgress = true;
    this.Orgservice.setOrgSettings(orgId, settings)
      .then(onSuccess)
      .then(this.notifySuccess.bind(this))
      .catch(this.notifyError.bind(this))
      .finally(this.stopLoading.bind(this));
  }

  public stopLoading() {
    this.savingProgress = false;
  }

  private notifySuccess() {
    this.Notification.success('partnerProfile.processing');
  }

  private notifyError(response) {
    this.Notification.errorResponse(response, 'errors.statusError', {
      status: response.status,
    });
  }
}

class Partner {
  public userName: string;
  public displayName: string;
  public name: { givenName: string, familyName: string };
}
