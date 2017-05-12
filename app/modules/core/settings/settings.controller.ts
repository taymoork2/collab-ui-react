
import { SettingSection } from './settingSection';
import { AuthenticationSetting } from './authentication/authenticationSetting.component';
import { BrandingSetting } from './branding/brandingSetting.component';
import { DomainsSetting } from './domain/domainsSetting.component';
import { RetentionSetting } from './retention/retentionSetting.component';
import { SecuritySetting } from './security/securitySetting.component';
import { SipDomainSetting } from './sipDomain/sipDomainSetting.component';
import { SupportSetting } from './supportSection/supportSetting.component';
import { PrivacySetting } from './privacySection/privacySettings.component';
import { DirSyncSetting } from './dirsync/dirSyncSetting.component';

export class SettingsCtrl {

  public security: SettingSection;
  public privacy: SettingSection;
  public domains: SettingSection;
  public sipDomain: SettingSection;
  public authentication: SettingSection;
  public branding: SettingSection;
  public support: SettingSection;
  public retention: SettingSection;
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
    private ITProPackService,
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
      this.initSecurity();
      this.authentication = new AuthenticationSetting();
      this.domains = new DomainsSetting();
      this.privacy = new PrivacySetting();
      this.sipDomain = new SipDomainSetting();
      this.dirsync = new DirSyncSetting();
      this.initRetention();
    }

    let settingsToShow = _.get<any>(this.$stateParams, 'showSettings', null);
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
    let settingElement = $(`setting-section[setting="settingsCtrl.${settingsToShow}"]`);
    if (_.isElement(settingElement[0])) {
      settingElement[0].scrollIntoView({ behavior: 'instant' });
      let body = $('body');
      body.scrollTop(body.scrollTop() - $('.settings').offset().top);
    }
  }

  private initBranding() {
    if (this.Authinfo.isPartner() || this.Authinfo.isDirectCustomer()) {
      this.branding = new BrandingSetting();
    } else if (this.Authinfo.isCustomerAdmin()) {
      let params = {
        basicInfo: true,
      };
      this.Orgservice.getOrg(_.noop, null, params).then(response => {
        if (_.get(response, 'data.orgSettings.allowCustomerLogos')) {
          this.branding = new BrandingSetting();
        }
      });
    }
  }

  private initSecurity() {
    this.FeatureToggleService.atlasPinSettingsGetStatus().then((toggle) => {
      if (toggle) {
        this.security = new SecuritySetting();
      }
    });
  }

  private initRetention() {
    let promises = {
      retentionToggle: this.FeatureToggleService.atlasDataRetentionSettingsGetStatus(),
      proPackPurchased: this.ITProPackService.hasITProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises).then((result) => {
      if (result.retentionToggle) {
        this.retention = new RetentionSetting(result.proPackPurchased);
      }
    });
  }
}
