
import { FileSharingControlSettingComponent } from './fileSharingControlSetting.component';

import notificationsModuleName from 'modules/core/notifications';
import proPackModuleName from 'modules/core/proPack';

export default angular.module('core.settings.fileSharingControl', [
  require('collab-ui-ng').default,
  require('modules/core/scripts/services/accountorgservice'),
  require('modules/core/scripts/services/authinfo'),
  proPackModuleName,
  notificationsModuleName,
])
  .component('fileSharingControlSetting', new FileSharingControlSettingComponent())
  .name;
