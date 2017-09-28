
import { FileSharingControlSettingComponent } from './fileSharingControlSetting.component';

import notificationModule from 'modules/core/notifications';
import ProPack from 'modules/core/proPack';

export default angular.module('core.settings.fileSharingControl', [
  require('angular-cache'),
  require('collab-ui-ng').default,
  require('modules/core/scripts/services/accountorgservice'),
  require('modules/core/scripts/services/authinfo'),
  ProPack,
  notificationModule,
])
  .component('fileSharingControlSetting', new FileSharingControlSettingComponent())
  .name;
