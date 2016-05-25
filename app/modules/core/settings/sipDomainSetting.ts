/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class SipDomainSetting extends Setting {
    constructor(ctrl:SettingsController) {
      super('sipDomain', ctrl);
    }
  }
}
