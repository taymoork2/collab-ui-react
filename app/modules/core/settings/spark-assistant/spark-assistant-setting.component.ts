import { SettingSection } from '../settingSection';
import { SparkAssistantSettingController } from './spark-assistant-setting.controller';

export class SparkAssistantSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('sparkAssistant');
    this.subsectionDescription = '';
  }
}

export class SparkAssistantSettingComponent implements ng.IComponentOptions {
  public controller = SparkAssistantSettingController;
  public template = require('modules/core/settings/spark-assistant/spark-assistant-setting.tpl.html');
  public bindings = {
    ftsw: '<',
  };
}
