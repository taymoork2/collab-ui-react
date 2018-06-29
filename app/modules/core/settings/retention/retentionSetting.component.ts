import { ProPackSettingSection } from '../proPackSettingSection';

import { RetentionSettingController } from './retentionSetting.controller';

export class RetentionSetting extends ProPackSettingSection {

  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('retention', proPackPurchased);
  }
}

export class RetentionSettingComponent implements ng.IComponentOptions {
  public controller = RetentionSettingController;
  public controllerAs = 'vm';
  public template = require('modules/core/settings/retention/retentionSetting.tpl.html');
}
