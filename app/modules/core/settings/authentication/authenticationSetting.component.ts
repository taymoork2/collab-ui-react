import { SettingSection } from '../settingSection';
import { AuthenticationSettingController } from './authenticationSetting.controller';

export class AuthenticationSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('authentication');
    this.subsectionDescription = '';
  }
}

export class AuthenticationSettingComponent implements ng.IComponentOptions {
  public controller = AuthenticationSettingController;
  public controllerAs = 'vm';
  public template = require('modules/core/settings/authentication/authenticationSetting.tpl.html');
}
