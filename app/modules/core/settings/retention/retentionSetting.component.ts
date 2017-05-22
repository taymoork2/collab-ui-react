import { SettingSection } from '../settingSection';

import { RetentionSettingController } from './retentionSetting.controller';

export class RetentionSetting extends SettingSection {

  public icon: string = '';
  public tooltipText: string = '';

  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('retention');
    if (!proPackPurchased) {
      this.icon = 'icon-certified';
      this.tooltipText = 'globalSettings.retention.proPackInfoCopy';
    }
  }
}

export class RetentionSettingComponent implements ng.IComponentOptions {
  public controller = RetentionSettingController;
  public controllerAs = 'vm';
  public templateUrl = 'modules/core/settings/retention/retentionSetting.tpl.html';
}

