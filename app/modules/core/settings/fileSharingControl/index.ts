
import { FileSharingControlSettingComponent } from './fileSharingControlSetting.component';

import notificationsModuleName from 'modules/core/notifications';
import proPackModuleName from 'modules/core/proPack';
import modalModuleName from 'modules/core/modal';
import orgSettingsModuleName from 'modules/core/shared/org-settings';

export default angular.module('core.settings.fileSharingControl', [
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/authinfo'),
  modalModuleName,
  notificationsModuleName,
  orgSettingsModuleName,
  proPackModuleName,
])
  .component('fileSharingControlSetting', new FileSharingControlSettingComponent())
  .name;
