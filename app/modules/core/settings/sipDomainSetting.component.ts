/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class SipDomainSetting extends SettingSection {
    constructor() {
      super('sipDomain');
    }
  }
  angular.module('Core').component('sipdomainSetting', {
    controller: 'RegisterSipUriPrefixCtrl',
    templateUrl:'modules/core/settings/sipUriSettings/registerSipUriPrefix.tpl.html'
  });
}
