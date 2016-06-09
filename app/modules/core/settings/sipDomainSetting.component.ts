/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class SipDomainSetting extends SettingSection {

    /* @ngInject */
    constructor() {
      super('sipDomain');
      this.subsectionLabel = '';
      this.subsectionDescription = '';
    }
  }
  angular.module('Core').component('sipdomainSetting', {
    bindings: {
      showSaveButton: '<'
    },
    controller: 'EnterpriseSettingsCtrl',
    templateUrl:'modules/core/settings/sipDomain/sipDomainSetting.tpl.html',
    //templateUrl:'modules/core/setupWizard/enterpriseSettings/enterprise.setSipDomain.tpl.html',
  });
}
