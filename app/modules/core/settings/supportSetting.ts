/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class SupportSetting extends Setting {

    constructor(ctrl:SettingsController) {
      super('support', ctrl);
      this.subsectionLabel = '';
      this.subsectionDescription = '';
    }
  }
}
