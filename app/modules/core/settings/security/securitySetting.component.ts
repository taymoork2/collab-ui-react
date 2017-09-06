import { ProPackSettingSection } from '../proPackSettingSection';

import { SecuritySettingController } from './securitySetting.controller';

export class SecuritySetting extends ProPackSettingSection {

  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('security', proPackPurchased);
    this.subsectionDescription = '';
  }
}

export class SecuritySettingComponent implements ng.IComponentOptions {
  public controller = SecuritySettingController;
  public controllerAs = 'secCtrl';
  public template = require('modules/core/settings/security/securitySetting.tpl.html');
}
