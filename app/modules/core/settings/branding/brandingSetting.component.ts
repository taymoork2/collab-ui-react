import { SettingSection } from '../settingSection';
const BrandingCtrl = require('modules/core/partnerProfile/branding/brandingCtrl');

export class BrandingSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('branding');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}

export class BrandingSettingComponent implements ng.IComponentOptions {
  public controller = BrandingCtrl;
  public controllerAs = 'bctrl';
  public bindings = {
    showBranding: '<',
  };
  public template = require('modules/core/partnerProfile/branding/branding.tpl.html');
  public transclude = true;
}
