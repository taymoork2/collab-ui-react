/// <reference path="../SettingSection.ts"/>
namespace globalsettings {

  export class SupportSetting extends SettingSection {

    get appType():string {
      return 'Squared';
    }

    /* @ngInject */
    constructor(Authinfo, $translate) {
      super('support');
      this.subsectionLabel = '';
      this.subsectionDescription = '';
    }
  }
  angular.module('Core').component('supportSetting', {
    controller: 'SupportSettings as ctrl',
    templateUrl: 'modules/core/settings/supportSection/supportSection.tpl.html',
  });
}
