namespace Settings {

  class Setting {

    public title:string;

    constructor(settingTitle:string) {
      this.title = settingTitle;
    }
  }

  class SettingsCtrl {

    private settings:Array<Setting>;

    /* @ngInject */
    constructor(Orgservice, private $q, private Authinfo) {

      this.settings = [
        new Setting('Branding'),
        new Setting('SIP Domain'),
        new Setting('Domains')
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
