/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class SipDomainSetting extends SettingSection {

    /* @ngInject */
    constructor() {
      super('sipDomain');
      this.subsectionLabel = 'firstTimeWizard.setSipDomainTitle';
      this.subsectionDescription = '';
    }
  }
  angular.module('Core').component('sipdomainSetting', {
    bindings: {
      showSaveButton: '<'
    },
    controller: 'SipDomainSettingController as vm',
    templateUrl:'modules/core/settings/sipDomain/sipDomainSetting.tpl.html',
  });
}
