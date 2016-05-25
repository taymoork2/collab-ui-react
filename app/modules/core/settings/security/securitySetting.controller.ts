namespace globalsettings {
  export class SecuritySettingController {

    requireProtectedDevices:boolean = undefined;

    /* @ngInject */
    constructor() {
      //get the current setting:
      setTimeout( this.settingLoaded.bind(this), 2400, true);
    }

    settingLoaded(requireProtectedDevices:boolean) {
      this.requireProtectedDevices = requireProtectedDevices;
    }

    requireProtectedDevicesUpdate(){
      if (this.requireProtectedDevices != undefined){
        this.requireProtectedDevices = !this.requireProtectedDevices;
      }

      alert('dev changed to:'+ this.requireProtectedDevices);
    }
  }
  angular.module('Core')
    .controller('SecuritySettingController', SecuritySettingController);
}
