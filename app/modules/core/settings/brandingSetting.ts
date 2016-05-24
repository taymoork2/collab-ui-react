/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class BrandingSetting extends Setting {
    constructor(ctrl:SettingsController) {
      super('branding', ctrl);
      this.subsectionDescription = '';
    }
  }
}
