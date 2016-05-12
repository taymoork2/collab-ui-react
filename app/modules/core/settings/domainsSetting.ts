/// <reference path="Setting.ts"/>
namespace globalsettings {
  
  export class DomainsSetting extends Setting {
    constructor(ctrl:SettingsController) {
      super('domains', ctrl);
      this.subsectionLabel = 'domainManagement.title';
      this.subsectionDescription = 'domainManagement.description';
    }
  }
}
