import { SettingSection } from '../settingSection';
import { SupportSettingsController } from './support.section.controller';

export class SupportSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('support');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}

export class SupportSettingComponent implements ng.IComponentOptions {
  public controller = SupportSettingsController;
  public controllerAs = 'ctrl';
  public template = require('modules/core/settings/supportSection/supportSection.tpl.html');
}
