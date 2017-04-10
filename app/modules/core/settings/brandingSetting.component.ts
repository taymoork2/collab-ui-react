import { SettingSection } from './settingSection';

export class BrandingSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('branding');
    this.subsectionLabel = '';
    this.subsectionDescription = ' ';
  }
}

angular.module('Core').component('brandingSetting', {
  controller: 'BrandingCtrl as bctrl',
  templateUrl: 'modules/core/partnerProfile/branding/branding.tpl.html',
});
