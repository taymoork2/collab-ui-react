namespace globalsettings {

  export class SettingSection {

    public title:string;
    public template:string;
    public subsectionLabel:string;
    public subsectionDescription:string;

    public key:string;
    public show:boolean = false;

    constructor(settingKey:string) {
      this.key = settingKey;

      this.title = `globalSettings.${settingKey}.title`;
      this.subsectionLabel = `globalSettings.${settingKey}.subsectionLabel`
      this.subsectionDescription = `globalSettings.${settingKey}.subsectionDescription`;
      this.template = `modules/core/settings/setting-.${settingKey}.tpl.html`;
    }
  }

  angular.module('Core').component('settingSection', {
    bindings: {
      setting: '<',
      hideBottomLine: '<'
    },
    transclude: true,
    templateUrl: "modules/core/settings/settingSection.tpl.html"
  });
}
