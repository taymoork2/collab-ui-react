namespace Settings {

  class Setting {

    public title:string;

    constructor(settingKey:string) {
      this.title = "settings." + settingKey + ".title";
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
