import { SettingSection } from '../settingSection';
import { SecuritySettingController } from './securitySetting.controller';

export class SecuritySetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('security');
    this.subsectionDescription = '';
  }
}

export class SecuritySettingComponent implements ng.IComponentOptions {
  public controller = SecuritySettingController;
  public controllerAs = 'secCtrl';
  public templateUrl = 'modules/core/settings/security/securitySetting.tpl.html';
}
