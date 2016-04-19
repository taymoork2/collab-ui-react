namespace Settings {

  class Setting {

    public title:string;

    public template:string;

    constructor(settingKey:string) {
      this.title = 'settings.' + settingKey + '.title';
      this.template = 'modules/core/settings/setting-' + settingKey + '.tpl.html';
    }
  }

  class SettingsCtrl {

    private settings:Array<Setting>;

    /* @ngInject */
    constructor(Orgservice, private $q, private Authinfo) {

      this.settings = [
        new Setting('sipDomain'),
        new Setting('domains'),
        new Setting('authentication')
      ]
    }

    public getSettings():Array<Setting> {
      return this.settings;
    }
  }
  angular
    .module('Core')
    .controller('SettingsCtrl', SettingsCtrl);
}
