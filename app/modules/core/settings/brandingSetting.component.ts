namespace globalsettings {

  export class BrandingSetting extends SettingSection {

    /* @ngInject */
    constructor() {
      super('branding');
      this.subsectionLabel = 'branding.title';
      this.subsectionDescription = 'branding.description';
    }
  }
  
  FeatureToggle.support(FeatureToggle.features.brandingWordingChange).then(function(toggle){
    angular.module('Core').component('brandingSetting', {
      controller: 'BrandingCtrl as bctrl',
      templateUrl:'modules/core/partnerProfile/branding/branding' + (toggle ? 'WordingChange': '') + '.tpl.html',
    });
  }) 
}