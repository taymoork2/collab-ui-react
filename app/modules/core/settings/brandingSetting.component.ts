namespace globalsettings {

  export class BrandingSetting extends SettingSection {

    /* @ngInject */
    constructor() {
      super('branding');
      this.subsectionLabel = '';
      this.subsectionDescription = '';
    }
  }

  angular.module('Core').component('brandingSetting', {
    controller: 'BrandingCtrl as bctrl',
    template:'modules/core/partnerProfile/branding/branding.tpl.html',
  });
}