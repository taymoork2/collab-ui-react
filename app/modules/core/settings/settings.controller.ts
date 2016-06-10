/// <reference path="authenticationSetting.component.ts"/>
/// <reference path="domainsSetting.component.ts"/>
/// <reference path="dataPolicySetting.component.ts"/>
/// <reference path="sipDomainSetting.component.ts"/>
/// <reference path="supportSection/supportSetting.component.ts"/>
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
    constructor(Authinfo, FeatureToggleService) {
      if (Authinfo.isPartner()) {
        //Add setting sections for partner admins here.
      } else {
        this.domains = new DomainsSetting();
        this.sipDomain = new SipDomainSetting();
        this.authentication = new AuthenticationSetting();
        this.support = new SupportSetting();
        // PrivacySetting.shouldItShow(FeatureToggleService, ()=> {
          this.privacy = new PrivacySetting();
        // });
        this.dataPolicy = new DataPolicySetting();
      }
    }
  }
  angular
    .module('Core')
    .controller('SettingsCtrl', SettingsCtrl);
}
