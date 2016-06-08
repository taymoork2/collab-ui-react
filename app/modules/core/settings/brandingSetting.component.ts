namespace globalsettings {

  export class BrandingSetting extends SettingSection {

    /* @ngInject */
    constructor() {
      super('branding');
      this.subsectionLabel = 'branding.title';
      this.subsectionDescription = 'branding.description';
    }
  }
  angular.module('Core').component('brandingSetting', {
    controller: 'BrandingCtrl as bctrl',
    templateUrl:'modules/core/partnerProfile/brandingWordingChange.tpl.html',
  });
}