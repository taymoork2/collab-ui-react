/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class SupportSetting extends SettingSection {

    constructor() {
      super('support');
    }
  }
  angular.module('Core').component('supportSetting', {
    controller: 'SupportSettingController as vm',
    templateUrl:'modules/core/settings/support/supportSetting.tpl.html'
  });
}
