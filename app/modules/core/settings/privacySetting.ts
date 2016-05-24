/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class PrivacySetting extends Setting {

    constructor(ctrl:SettingsController) {
      super('privacy', ctrl);
      this.subsectionDescription = '';
    }
  }
}
