/// <reference path="AuthenticationSetting.component.ts"/>
/// <reference path="BrandingSetting.component.ts"/>
/// <reference path="DataPolicySetting.component.ts"/>
/// <reference path="domainsSetting.component.ts"/>
/// <reference path="PrivacySetting.component.ts"/>
/// <reference path="SecuritySetting.component.ts"/>
/// <reference path="SipDomainSetting.component.ts"/>
/// <reference path="SupportSetting.component.ts"/>
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
    constructor(Authinfo) {

      if (Authinfo.isPartner()) {
     //   this.branding = new BrandingSetting();
        this.support = new DomainsSetting();
      } else {
        this.security = new SecuritySetting();
        this.privacy = new PrivacySetting();
        this.domains = new DomainsSetting();
        this.sipDomain = new SipDomainSetting();
        this.authentication = new AuthenticationSetting();
     //   this.branding = new BrandingSetting();
        this.support = new SupportSetting();
        this.dataPolicy = new DataPolicySetting();
      }
    }
  }
  angular
    .module('Core')
    .controller('SettingsCtrl', SettingsCtrl);
}
