/// <reference path="AuthSetting.ts"/>
/// <reference path="BrandingSetting.ts"/>
/// <reference path="DataPolicySetting.ts"/>
/// <reference path="DomainsSetting.ts"/>
/// <reference path="PrivacySetting.ts"/>
/// <reference path="SecuritySetting.ts"/>
/// <reference path="SipDomainSetting.ts"/>
/// <reference path="SupportSetting.ts"/>
namespace globalsettings {

  export class SettingsCtrl implements SettingsController {

    private settings:Array<Setting>;

    public translate:any;
    public authinfo:any;

    /* @ngInject */
    constructor(Authinfo, $translate, AuthModeService) {

      this.translate = $translate;
      this.authinfo = Authinfo;

      if (Authinfo.isPartner()) {
        this.settings = [
          new BrandingSetting(this),
          new SupportSetting(this)
        ];
      } else {
        this.settings = [
       //   new SecuritySetting(this),
        //  new PrivacySetting(this),
          new DomainsSetting(this),
          new SipDomainSetting(this),
          new AuthSetting(this, AuthModeService),
          new BrandingSetting(this),
          new SupportSetting(this),
         // new DataPolicySetting(this)
        ];
      }
    }

    public getSettings():Array<Setting> {
      return this.settings;
    }
  }
  angular
    .module('Core')
    .controller('SettingsCtrl', SettingsCtrl);
}
