import { SettingSection } from '../settingSection';
import { SparkAssistantSettingController } from './spark-assistant-setting.controller';

export class SparkAssistantSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('sparkAssistant');
    this.subsectionDescription = '';
    this.subsectionLabel = 'globalSettings.sparkAssistant.subsectionLabel';
    this.subsectionDescription = '';
  }
}

export class SparkAssistantSettingComponent implements ng.IComponentOptions {
  public controller = SparkAssistantSettingController;
  public controllerAs = 'ctrl';
  public template = require('modules/core/settings/spark-assistant/spark-assistant-setting.tpl.html');
  public bindings = {
    ftsw: '<',
  };
}
