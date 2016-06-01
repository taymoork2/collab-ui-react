/// <reference path="SettingSection.ts"/>
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
      // if (Authinfo.isPartner())
      //   this.subsectionDescription = Authinfo.isPartner()
      //     ? $translate.instant('partnerProfile.supportInfo', {app: this.appType})
      //     : $translate.instant('customerProfile.supportInfo', {app: this.appType});
    }
  }
  angular.module('Core').component('supportSetting', {
    controller: 'SupportSettings as ctrl',
    templateUrl: 'modules/core/partnerProfile/supportSection.tpl.html',
  });
}
