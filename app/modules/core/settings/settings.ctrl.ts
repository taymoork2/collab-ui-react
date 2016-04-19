namespace Settings {

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
      this.template = 'modules/core/settings/setting-' + settingKey + '.tpl.html';
      this.subsectionLabel = 'Subsection Label ' + settingKey;
      this.subsectionDescription = 'Subsection Description ' + settingKey;
      this.isPartner = ctrl.authinfo.isPartner();
      //this.isManaged = false;
      //this.isCiscoSupport = ctrl.authinfo.isCiscoSupport();
     // this.isCiscoHelp = ctrl.authinfo.isCiscoHelp();
      this.translate = ctrl.translate;
    }
  }

  class AuthSetting extends Setting {
    constructor(ctrl:SettingsCtrl) {
      super('authentication', ctrl);
      this.subsectionLabel = 'globalSettings.' + 'authentication' + '.subsectionLabel';
      this.subsectionDescription = '';
    }

    public enableSSO = 1;

    public configureSSOOptions = [{
      label: this.translate.instant('ssoModal.disableSSO'),
      value: 1,
      name: 'ssoOptions',
      id: 'ssoNoProvider'
    }, {
      label: this.translate.instant('ssoModal.enableSSO'),
      value: 0,
      name: 'ssoOptions',
      id: 'ssoProvider'
    }];
  }

  class SupportSetting extends Setting {

    constructor(ctrl:SettingsCtrl) {
      super('support', ctrl);
      this.subsectionLabel = 'globalSettings.' + 'support' + '.subsectionLabel';
      this.subsectionDescription = '';
    }
  }

  class SettingsCtrl {

    private settings:Array<Setting>;

    public translate:any;
    public authinfo:any;

    /* @ngInject */
    constructor(Authinfo, $translate) {

      this.translate = $translate;
      this.authinfo = Authinfo;

      if (Authinfo.isPartner()) {
        this.settings = [
          new Setting('branding', this),
          new SupportSetting(this)
        ];
      } else {
        this.settings = [
          new Setting('sipDomain', this),
          new Setting('domains', this),
          new AuthSetting(this),
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
