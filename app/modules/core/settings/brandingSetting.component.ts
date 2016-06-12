/// <reference path="settingSection.ts"/>
namespace globalsettings {

  export class BrandingSetting extends SettingSection {
    /* @ngInject */
    constructor() {
      super('branding');
      this.subsectionLabel = '';
      this.subsectionDescription = '';
    }
  }
<<<<<<< HEAD

  angular.module('Core').component('brandingSetting', {
    controller: 'BrandingCtrl as bctrl',
    template:'modules/core/partnerProfile/branding/branding.tpl.html',
  });
}
=======
  angular.module('Core').component('brandingSettingOld', {
    controller: 'BrandingCtrl as bctrl',
    templateUrl: 'modules/core/partnerProfile/branding/branding.tpl.html'
  });
  angular.module('Core').component('brandingSettingNew', {
    controller: 'BrandingCtrl as bctrl',
    templateUrl: 'modules/core/partnerProfile/branding/brandingWordingChange.tpl.html'
  });
  angular.module('Core').component('brandingSetting', {
    controller: 'BrandingFeatureCtrl',
    template: '<div>{{$ctrl.feature}}</div><branding-setting-new ng-if="$ctrl.feature"></branding-setting-new><branding-setting-old ng-if="!$ctrl.feature"></branding-setting-old>'
  });
}
>>>>>>> 5e1ed502a61ea582410ac05ec49ce51e6577a94c
