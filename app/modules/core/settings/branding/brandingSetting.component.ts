import { SettingSection } from '../settingSection';
import { BrandingCtrl } from 'modules/core/partnerProfile/branding';

export class BrandingSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('branding');
    this.subsectionLabel = '';
    this.subsectionDescription = ' ';
  }
}

export class BrandingSettingComponent implements ng.IComponentOptions {
  public controller = BrandingCtrl;
  public controllerAs: 'bctrl';
  public templateUrl = 'modules/core/partnerProfile/branding/branding.tpl.html';
}
