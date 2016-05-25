/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class DataPolicySetting extends SettingSection {
    constructor() {
      super('dataPolicy');
    }
  }
  angular.module('Core').component('datapolicySetting', {
    controller: 'DataPolicySettingController as vm',
    templateUrl:'modules/core/settings/dataPolicy/dataPolicySetting.tpl.html',
  });
}
