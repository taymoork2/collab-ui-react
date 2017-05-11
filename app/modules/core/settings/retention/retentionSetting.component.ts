import { SettingSection } from '../settingSection';

import { RetentionSettingController } from './retentionSetting.controller';

export class RetentionSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('retention');
  }
}

export class RetentionSettingComponent implements ng.IComponentOptions {
  public controller = RetentionSettingController;
  public controllerAs = 'vm';
  public templateUrl = 'modules/core/settings/retention/retentionSetting.tpl.html';
}

