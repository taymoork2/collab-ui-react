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
  constructor(Authinfo, private Orgservice, private FeatureToggleService) {
    if (Authinfo.isPartner()) {
      //Add setting sections for partner admins here.
      this.support = new SupportSetting();
      this.initBranding();
    } else {
      this.initSecurity();
      this.domains = new DomainsSetting();
      this.sipDomain = new SipDomainSetting();
      this.authentication = new AuthenticationSetting();
      this.support = new SupportSetting();
      this.initBrandingForNonPartner();
      this.privacy = new PrivacySetting();
      this.retention = new RetentionSetting();
    }
  }

  private initBrandingForNonPartner(){
    this.Orgservice.getOrg(data => {
      if (_.get(data, 'orgSettings.allowCustomerLogos')) {
        this.initBranding();
      }
    });
  }

  private initBranding() {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.brandingWordingChange).then(() => {
      //this is done to prevent flashing between the two branding templates, it will be revealed after toggle is resolved
      this.branding = new BrandingSetting();
    });
  }

  private initSecurity() {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasAppleFeatures).then(toggle=> {
      if (toggle) {
        this.security = new SecuritySetting();
      }
    });
  }
}
angular
  .module('Core')
  .controller('SettingsCtrl', SettingsCtrl);
