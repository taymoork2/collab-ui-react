/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class SecuritySetting extends SettingSection {

    constructor() {
      super('security');
      this.subsectionDescription = '';
    }
  }
  angular.module('Core').component('securitySetting', {
    controller: 'SecuritySettingController as secCtrl',
    templateUrl:'modules/core/settings/security/securitySetting.tpl.html',
  });
}
