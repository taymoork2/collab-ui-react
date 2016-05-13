/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class PrivacySetting extends Setting {

    allowReadOnlyOrgAccess:boolean = undefined;
    sendUsageData:boolean = undefined;

    constructor(ctrl:SettingsController) {
      super('privacy', ctrl);

      setTimeout( this.allowReadOnlyOrgAccessLoaded.bind(this), 800, true);
      setTimeout( this.sendUsageDataLoaded.bind(this), 1200, false);
    }

    allowReadOnlyOrgAccessLoaded(allowReadOnlyOrgAccess:boolean) {
      this.allowReadOnlyOrgAccess = allowReadOnlyOrgAccess;
    }

    allowReadOnlyOrgAccessUpdate(){
      alert('allowReadOnlyOrgAccess changed to' + this.allowReadOnlyOrgAccess);
    }

    sendUsageDataLoaded(sendUsageData:boolean) {
      this.sendUsageData = sendUsageData;
    }

    sendUsageDataUpdate(){
        alert('sendUsageData changed to' + this.sendUsageData);
    }
  }
}
