namespace globalsettings {

  class Setting {

    public title:string;
    public template:string;
    public subsectionLabel:string;
    public subsectionDescription:string;
    public isPartner:boolean;
    public isManaged:boolean;
    public isCiscoSupport:boolean;
    public isCiscoHelp:boolean;
    public translate:any;

    constructor(settingKey:string, ctrl:SettingsCtrl) {
      this.title = 'globalSettings.' + settingKey + '.title';

      this.subsectionLabel = 'globalSettings.' + settingKey + '.subsectionLabel';
      this.subsectionDescription = 'globalSettings.' + settingKey + '.subsectionDescription';
      this.template = 'modules/core/settings/setting-' + settingKey + '.tpl.html';

      this.isPartner = ctrl.authinfo.isPartner();
      //this.isManaged = false;
      //this.isCiscoSupport = ctrl.authinfo.isCiscoSupport();
     // this.isCiscoHelp = ctrl.authinfo.isCiscoHelp();
      this.translate = ctrl.translate;
    }
  }

  class AuthSetting extends Setting {

    public authModeService:AuthModeService;

    constructor(ctrl:SettingsCtrl, authModeService:AuthModeService) {
      super('authentication', ctrl);
      this.subsectionDescription = '';
      this.authModeService = authModeService;
    }

    public configureSSOOptions = [{
      label: this.translate.instant('ssoModal.disableSSO'),
      value: 0,
      name: 'ssoOptions',
      id: 'ssoNoProvider'
    }, {
      label: this.translate.instant('ssoModal.enableSSO'),
      value: 1,
      name: 'ssoOptions',
      id: 'ssoProvider'
    }];
  }

  class SupportSetting extends Setting {

    constructor(ctrl:SettingsCtrl) {
      super('support', ctrl);
      this.subsectionLabel = '';
      this.subsectionDescription = '';
    }
  }

  class BrandingSetting extends Setting {
    constructor(ctrl:SettingsCtrl) {
      super('branding', ctrl);
      this.subsectionDescription = '';
    }
  }

  class SipDomainSetting extends Setting {
    constructor(ctrl:SettingsCtrl) {
      super('sipDomain', ctrl);
    }
  }

  class DomainSetting extends Setting {
    constructor(ctrl:SettingsCtrl) {
      super('domains', ctrl);
      this.subsectionLabel = 'domainManagement.title';
      this.subsectionDescription = 'domainManagement.description';
    }
  }

  class SettingsCtrl {

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
          new BrandingSetting(this),
          new SipDomainSetting(this),
          new DomainSetting(this),
          new AuthSetting(this, AuthModeService),
          new SupportSetting(this)
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
