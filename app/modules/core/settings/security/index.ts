import { SecuritySettingComponent } from './securitySetting.component';

import notificationModule from 'modules/core/notifications';
import ITProPack from 'modules/core/itProPack';

export default angular.module('core.settings.security', [
  require('angular-cache'),
  require('scripts/app.templates'),
  require('collab-ui-ng').default,
  require('angular-translate'),
  require('modules/core/scripts/services/accountorgservice'),
  ITProPack,
  notificationModule,
])
  .component('securitySetting', new SecuritySettingComponent())
  .name;
