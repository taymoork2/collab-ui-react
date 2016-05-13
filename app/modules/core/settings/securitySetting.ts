/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class SecuritySetting extends Setting {

    requireProtectedDevices:boolean = undefined;

    constructor(ctrl:SettingsController) {
      super('security', ctrl);
      this.subsectionDescription = '';

      //get the current setting:
      setTimeout( this.settingLoaded.bind(this), 2400, true);
    }

    settingLoaded(requireProtectedDevices:boolean) {
      this.requireProtectedDevices = requireProtectedDevices;
    }

    requireProtectedDevicesUpdate(){
    //  console.log('dev changed to', this.requireProtectedDevices);
    }
  }
}
