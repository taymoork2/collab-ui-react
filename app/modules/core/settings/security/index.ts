import notificationModuleName from 'modules/core/notifications';
import proPackModuleName from 'modules/core/proPack';
import orgSettingsModuleName from 'modules/core/shared/org-settings';
import { SecuritySettingComponent } from './security-setting.component';

export default angular.module('core.settings.security', [
  require('@collabui/collab-ui-ng').default,
  require('angular-translate'),
  notificationModuleName,
  orgSettingsModuleName,
  proPackModuleName,
])
  .component('securitySetting', new SecuritySettingComponent())
  .name;
