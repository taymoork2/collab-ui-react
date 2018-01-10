import { SecuritySettingComponent } from './securitySetting.component';

import notificationModule from 'modules/core/notifications';
import ProPack from 'modules/core/proPack';

export default angular.module('core.settings.security', [
  require('angular-cache'),
  require('@collabui/collab-ui-ng').default,
  require('angular-translate'),
  require('modules/core/scripts/services/accountorgservice'),
  ProPack,
  notificationModule,
])
  .component('securitySetting', new SecuritySettingComponent())
  .name;
