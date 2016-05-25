/// <reference path="SettingSection.ts"/>
/// <reference path="authentication/authenticationSetting.controller.ts"/>
namespace globalsettings {

  export class AuthenticationSetting extends SettingSection {

    constructor() {
      super('authentication');
      this.subsectionDescription = '';
    }
  }
  angular.module('Core').component('authenticationSetting', {
    controller: 'AuthenticationSettingController as vm',
    templateUrl:'modules/core/settings/authentication/authenticationSetting.tpl.html',
  });
}
