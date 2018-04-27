import { SettingSection } from '../../settingSection';

const BrandingCtrl = require('modules/core/partnerProfile/branding/brandingCtrl');

export class WebexVersionSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('webexVersion');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}

export class WebexVersionSettingComponent implements ng.IComponentOptions {
  public controller = BrandingCtrl;
  public controllerAs = 'bctrl';
  public template = require('modules/core/settings/webex/webexVersion/webex-version.html');
  public transclude = true;
}
