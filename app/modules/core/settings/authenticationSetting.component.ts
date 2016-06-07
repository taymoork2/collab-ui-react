/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class AuthenticationSetting extends SettingSection {

    /* @ngInject */
    constructor() {
      super('authentication');
      this.subsectionDescription = '';
    }
  }
  angular.module('Core').component('authenticationSetting', {
    bindings: {
    },
    controller: 'AuthenticationSettingController as vm',
    templateUrl: 'modules/core/settings/authentication/authenticationSetting.tpl.html',
  });
}
