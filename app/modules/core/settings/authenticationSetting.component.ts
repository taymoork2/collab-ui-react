import { SettingSection } from './settingSection';

export class AuthenticationSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('authentication');
    this.subsectionDescription = '';
  }
}
angular.module('Core').component('authenticationSetting', {
  bindings: {
  },
  controller: 'AuthenticationSettingController as vm',
  templateUrl: 'modules/core/settings/authentication/authenticationSetting.tpl.html',
});
