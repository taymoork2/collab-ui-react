/// <reference path="authenticationSetting.component.ts"/>
/// <reference path="securitySetting.component.ts"/>
/// <reference path="domainsSetting.component.ts"/>
/// <reference path="retentionSetting.component.ts"/>
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
      } else { // enable if they are a direct customer
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
}
