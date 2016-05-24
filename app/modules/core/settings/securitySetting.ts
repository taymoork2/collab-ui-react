/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class SecuritySetting extends Setting {

    ckbox1 = true;

    constructor(ctrl:SettingsController) {
      super('security', ctrl);
      this.subsectionDescription = '';
    }
  }
}
