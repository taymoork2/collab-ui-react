import { SecuritySettingComponent } from './securitySetting.component';

import notificationModuleName from 'modules/core/notifications';
import orgSettingsModuleName from 'modules/core/shared/org-settings';
import proPackModuleName from 'modules/core/proPack';

export default angular.module('core.settings.security', [
  require('@collabui/collab-ui-ng').default,
  require('angular-translate'),
  notificationModuleName,
  orgSettingsModuleName,
  proPackModuleName,
])
  .component('securitySetting', new SecuritySettingComponent())
  .name;
