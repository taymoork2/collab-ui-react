/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class DataPolicySetting extends Setting {

    constructor(ctrl:SettingsController) {
      super('dataPolicy', ctrl);
      this.subsectionDescription = '';
    }
  }
}
