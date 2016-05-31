/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class SipDomainSetting extends SettingSection {

    /* @ngInject */
    constructor() {
      super('sipDomain');
    }
  }
  angular.module('Core').component('sipdomainSetting', {
    controller: 'EnterpriseSettingsCtrl',
    templateUrl:'modules/core/setupWizard/enterpriseSettings/enterprise.setSipDomain.tpl.html',
  });
}
