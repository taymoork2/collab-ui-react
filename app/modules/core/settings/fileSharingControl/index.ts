
import { FileSharingControlSettingComponent } from './fileSharingControlSetting.component';

import notificationsModuleName from 'modules/core/notifications';
import proPackModuleName from 'modules/core/proPack';
import modalServiceModule from 'modules/core/modal';

export default angular.module('core.settings.fileSharingControl', [
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/accountorgservice'),
  require('modules/core/scripts/services/authinfo'),
  proPackModuleName,
  notificationsModuleName,
  modalServiceModule,
])
  .component('fileSharingControlSetting', new FileSharingControlSettingComponent())
  .name;
