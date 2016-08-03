import { SettingSection } from './settingSection';

export class BrandingSetting extends SettingSection {
  /* @ngInject */
  constructor() {
    super('branding');
    this.subsectionLabel = '';
    this.subsectionDescription = ' ';
  }
}

angular.module('Core').component('brandingSettingOld', {
  controller: 'BrandingCtrl as bctrl',
  templateUrl: 'modules/core/partnerProfile/branding/branding.tpl.html'
});
angular.module('Core').component('brandingSettingNew', {
  controller: 'BrandingCtrl as bctrl',
  templateUrl: 'modules/core/partnerProfile/branding/brandingWordingChange.tpl.html'
});
angular.module('Core').component('brandingSetting', {
  template: '<branding-setting-new cr-feature-toggle feature-show="atlas-branding-wording-change"></branding-setting-new><branding-setting-old cr-feature-toggle feature-hide="atlas-branding-wording-change"></branding-setting-old>'
});
