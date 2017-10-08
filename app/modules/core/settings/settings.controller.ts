import { SettingSection } from './settingSection';
import { AuthenticationSetting } from './authentication/authenticationSetting.component';
import { EmailSetting } from './email/emailSetting.component';
import { BrandingSetting } from './branding/brandingSetting.component';
import { DomainsSetting } from './domain/domainsSetting.component';
import { RetentionSetting } from './retention/retentionSetting.component';
import { ExternalCommunicationSetting } from './externalCommunication/externalCommunicationSetting.component';
import { FileSharingControlSetting } from './fileSharingControl/fileSharingControlSetting.component';

import { SecuritySetting } from './security/securitySetting.component';
import { SipDomainSetting } from './sipDomain/sipDomainSetting.component';
import { SupportSetting } from './supportSection/supportSetting.component';
import { PrivacySetting } from './privacySection/privacySettings.component';
import { DirSyncSetting } from './dirsync/dirSyncSetting.component';
import { DeviceBrandingSetting } from './deviceBranding/device-branding-setting.component';

export class SettingsCtrl {

  public security: SettingSection;
  public privacy: SettingSection;
  public domains: SettingSection;
  public sipDomain: SettingSection;
  public authentication: SettingSection;
  public email: SettingSection;
  public branding: SettingSection;
  public deviceBranding: SettingSection;
  public support: SettingSection;
  public retention: SettingSection;
  public externalCommunication: SettingSection;
  public fileSharingControl: SettingSection;
  public dirsync: SettingSection;

  // Footer and broadcast controls
  public saveCancelFooter: boolean = false;
  private readonly ACTIVATE_SAVE_BUTTONS: string = 'settings-control-activate-footer';
  private readonly REMOVE_SAVE_BUTTONS: string = 'settings-control-remove-footer';
  private readonly SAVE_BROADCAST: string = 'settings-control-save';
  private readonly CANCEL_BROADCAST: string = 'settings-control-cancel';

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $stateParams: ng.ui.IStateParamsService,
    private $timeout: ng.ITimeoutService,
    private Authinfo,
    private Orgservice,
    private FeatureToggleService,
    private ProPackService,
  ) {
  }

  public $onInit(): void {
    // provide these settings to everyone
    this.initBranding();
    this.support = new SupportSetting();

    this.$scope.$on(this.REMOVE_SAVE_BUTTONS, (): void => {
      this.saveCancelFooter = false;
    });

    this.$scope.$on(this.ACTIVATE_SAVE_BUTTONS, (): void => {
      this.saveCancelFooter = true;
    });

    // if they are not a partner, provide everything else
    if (!this.Authinfo.isPartner()) {
      this.authentication = new AuthenticationSetting();
      this.initEmailSuppress();
      this.domains = new DomainsSetting();
      this.privacy = new PrivacySetting();
      this.sipDomain = new SipDomainSetting();
      this.dirsync = new DirSyncSetting();
      if (this.Authinfo.isEnterpriseCustomer()) {
        this.initSecurity();
        this.initBlockExternalCommunication();
        this.initFileSharingControl();
        this.initRetention();
      }
    }
    //TODO temporary adding device branding
    this.initDeviceBranding();

    const settingsToShow = _.get<any>(this.$stateParams, 'showSettings', null);
    if (!_.isNull(settingsToShow)) {
      // scroll the selected settings section in to view.
      this.$timeout(() => {
        this.scrollIntoView(settingsToShow);
      });
    }
  }

  public save(): void {
    this.saveCancelFooter = false;
    this.$scope.$emit(this.SAVE_BROADCAST);
  }

  public cancel(): void {
    this.saveCancelFooter = false;
    this.$scope.$emit(this.CANCEL_BROADCAST);
  }

  public scrollIntoView(settingsToShow: string): void {
    const settingElement = $(`setting-section[setting="settingsCtrl.${settingsToShow}"]`);
    if (_.isElement(settingElement[0])) {
      settingElement[0].scrollIntoView({ behavior: 'instant' });
      const body = $('body');
      body.scrollTop(body.scrollTop() - ($('.settings').offset() || { top: 0 }).top);
    }
  }

  private initBranding() {
    if (this.Authinfo.isPartner() || this.Authinfo.isDirectCustomer()) {
      this.branding = new BrandingSetting();
    } else if (this.Authinfo.isCustomerAdmin()) {
      const params = {
        basicInfo: true,
      };
      this.Orgservice.getOrg(_.noop, null, params).then(response => {
        if (_.get(response, 'data.orgSettings.allowCustomerLogos')) {
          this.branding = new BrandingSetting();
        }
      });
    }
  }

  private initDeviceBranding() {
    this.FeatureToggleService.csdmDeviceBrandingGetStatus().then((toggle) => {
      if (toggle) {
        this.deviceBranding = new DeviceBrandingSetting();
      }
    });
  }

  private initSecurity() {
    const promises = {
      pinSettingsToggle: this.FeatureToggleService.atlasPinSettingsGetStatus(),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };
    this.$q.all(promises).then((result) => {
      if (result.pinSettingsToggle) {
        this.security = new SecuritySetting(result.proPackPurchased);
      }
    });
  }

  private initBlockExternalCommunication() {
    const promises = {
      blockExternalCommunicationToggle: this.FeatureToggleService.atlasBlockExternalCommunicationSettingsGetStatus(),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises).then((result) => {
      if (result.blockExternalCommunicationToggle) {
        this.externalCommunication = new ExternalCommunicationSetting(result.proPackPurchased);
      }
    });
  }

  private initFileSharingControl() {
    const promises = {
      fileSharingControlToggle: this.FeatureToggleService.atlasFileSharingControlSettingsGetStatus(),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises).then((result) => {
      if (result.fileSharingControlToggle) {
        //US22932 Temp remove Pro treatment
        //this.fileSharingControl = new FileSharingControlSetting(result.proPackPurchased);
        this.fileSharingControl = new FileSharingControlSetting(true);
      }
    });
  }

  private initRetention() {
    const promises = {
      retentionToggle: this.FeatureToggleService.atlasDataRetentionSettingsGetStatus(),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises).then((result) => {
      if (result.retentionToggle) {
        this.retention = new RetentionSetting(result.proPackPurchased);
      }
    });
  }

  private initEmailSuppress() {
    this.FeatureToggleService.atlasEmailSuppressGetStatus().then((toggle) => {
      if (toggle) {
        this.email = new EmailSetting();
      }
    });
  }
}
