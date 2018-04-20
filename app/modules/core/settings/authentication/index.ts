import { AuthenticationSettingComponent } from './authenticationSetting.component';

export default angular.module('core.settings.authentication', [
  require('angular-cache'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/org.service'),
])
  .component('authenticationSetting', new AuthenticationSettingComponent())
  .name;
