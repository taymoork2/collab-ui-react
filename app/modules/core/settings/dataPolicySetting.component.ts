/// <reference path="settingSection.ts"/>

namespace globalsettings {

  export class DataPolicySetting extends SettingSection {

    /* @ngInject */
    constructor() {
      super('dataPolicy');
    }
  }
  angular.module('Core').component('datapolicySetting', {
    bindings: {
    },
    controller: 'DataPolicySettingController as vm',
    templateUrl:'modules/core/settings/dataPolicy/dataPolicySetting.tpl.html',
  });
}
