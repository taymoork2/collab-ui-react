/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class SecuritySetting extends Setting {

    constructor(ctrl:SettingsController) {
      super('security', ctrl);
      this.subsectionDescription = '';
    }
  }
}
