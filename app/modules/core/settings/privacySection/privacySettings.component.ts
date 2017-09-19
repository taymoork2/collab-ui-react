import { SettingSection } from '../settingSection';
import { PrivacySettingController } from './privacy.settings.controller';

export class PrivacySetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('privacy');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}

export class PrivacySettingsComponent implements ng.IComponentOptions {
  public bindings = {
    hideUsagePart: '<',
  };
  public controller = PrivacySettingController;
  public controllerAs = 'vm';
  public template = require('modules/core/settings/privacySection/privacySettings.tpl.html');
}
