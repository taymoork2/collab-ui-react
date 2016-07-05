import { SettingSection } from './settingSection';
import { AuthenticationSetting } from './authenticationSetting.component';
import { BrandingSetting } from './brandingSetting.component';
import { DomainsSetting } from './domainsSetting.component';
import { RetentionSetting } from './retentionSetting.component';
import { SecuritySetting } from './securitySetting.component';
import { SipDomainSetting } from './sipDomainSetting.component';
import { SupportSetting } from './supportSection/supportSetting.component';
import { PrivacySetting } from './privacySection/privacySettings.component';

export class SettingsCtrl {

  public security:SettingSection;
  public privacy:SettingSection;
  public domains:SettingSection;
  public sipDomain:SettingSection;
  public authentication:SettingSection;
  public branding:SettingSection;
  public support:SettingSection;
  public retention:SettingSection;

  /* @ngInject */
  constructor($state, private Authinfo, private Orgservice, private FeatureToggleService, private hasFeatureToggle) {
    if(!hasFeatureToggle) {
      $state.go('login');
    }
    // provide these settings to everyone
    this.initBranding();
    this.support = new SupportSetting();

    // if they are not a partner, provide everything else
    if(!this.Authinfo.isPartner()) {
      this.initSecurity();
      this.authentication = new AuthenticationSetting();
      this.domains = new DomainsSetting();
      this.privacy = new PrivacySetting();
      this.sipDomain = new SipDomainSetting();
      this.retention = new RetentionSetting();
    }
  }

  private initBranding() {
    if(this.Authinfo.isPartner()) {
      this.FeatureToggleService.brandingWordingChangeGetStatus().then(() => {
        // this is done to prevent flashing between the two branding templates,
        // it will be revealed after toggle is resolved
        this.branding = new BrandingSetting();
      });
    } else if(this.Authinfo.isPartnerUser()) {
      this.Orgservice.getOrg(_.noop).then(data => {
        if (_.get(data, 'orgSettings.allowCustomerLogos')) {
          this.branding = new BrandingSetting();
        }
      });
    } else if(this.Authinfo.isDirectCustomer()) {
      this.branding = new BrandingSetting();
    }
  }

  private initSecurity() {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasAppleFeatures).then((toggle) => {
      if (toggle) {
        this.security = new SecuritySetting();
      }
    });
  }
}
angular
  .module('Core')
  .controller('SettingsCtrl', SettingsCtrl);
