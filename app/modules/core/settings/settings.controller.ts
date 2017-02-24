import './_settings.scss';
import { SettingSection } from './settingSection';
import { AuthenticationSetting } from './authenticationSetting.component';
import { BrandingSetting } from './brandingSetting.component';
import { DomainsSetting } from './domainsSetting.component';
import { RetentionSetting } from './retentionSetting.component';
import { SecuritySetting } from './securitySetting.component';
import { SipDomainSetting } from './sipDomainSetting.component';
import { SupportSetting } from './supportSection/supportSetting.component';
import { PrivacySetting } from './privacySection/privacySettings.component';
import { DirSyncSetting } from './dirSyncSetting.component';

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
    private $stateParams: ng.ui.IStateParamsService,
    private $timeout: ng.ITimeoutService,
    private Authinfo,
    private Orgservice,
    private FeatureToggleService,
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
      this.Orgservice.getOrg(_.noop).then(response => {
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
    this.FeatureToggleService.atlasDataRetentionSettingsGetStatus().then((toggle) => {
      if (toggle) {
        this.retention = new RetentionSetting();
      }
    });
  }
}
angular
  .module('Core')
  .controller('SettingsCtrl', SettingsCtrl);
