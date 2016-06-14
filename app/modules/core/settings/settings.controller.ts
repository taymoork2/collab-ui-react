/// <reference path="authenticationSetting.component.ts"/>
/// <reference path="domainsSetting.component.ts"/>
/// <reference path="dataPolicySetting.component.ts"/>
/// <reference path="sipDomainSetting.component.ts"/>
/// <reference path="supportSection/supportSetting.component.ts"/>
/// <reference path="brandingSetting.component.ts"/>
/// <reference path="privacySection/privacySettings.component.ts"/>
namespace globalsettings {

  export class SettingsCtrl {

    public security:SettingSection;
    public privacy:SettingSection;
    public domains:SettingSection;
    public sipDomain:SettingSection;
    public authentication:SettingSection;
    public branding:SettingSection;
    public support:SettingSection;
    public dataPolicy:SettingSection;

    /* @ngInject */
    constructor(Authinfo, private FeatureToggleService) {
      if (Authinfo.isPartner()) {
        //Add setting sections for partner admins here.
      } else {
        this.domains = new DomainsSetting();
        this.sipDomain = new SipDomainSetting();
        this.authentication = new AuthenticationSetting();
        this.support = new SupportSetting();
        this.branding = new BrandingSetting();
        this.privacy = new PrivacySetting();
        this.dataPolicy = new DataPolicySetting();
      }
      
      this.initBranding();
    }

    private initBranding() {
      this.FeatureToggleService.supports(this.FeatureToggleService.features.brandingWordingChange).then(toggle=> {
        //this is done to prevent flashing between the two branding templates, it will be revealed after toggle is resolved
        this.branding = new BrandingSetting();
      });
    }
  }
  angular
    .module('Core')
    .controller('SettingsCtrl', SettingsCtrl);
}
