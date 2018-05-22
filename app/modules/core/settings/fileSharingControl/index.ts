
import { FileSharingControlSettingComponent } from './fileSharingControlSetting.component';

import featureToggleModuleName from 'modules/core/featureToggle';
import modalModuleName from 'modules/core/modal';
import notificationsModuleName from 'modules/core/notifications';
import orgSettingsModuleName from 'modules/core/shared/org-settings';
import proPackModuleName from 'modules/core/proPack';

export default angular.module('core.settings.fileSharingControl', [
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/authinfo'),
  featureToggleModuleName,
  modalModuleName,
  notificationsModuleName,
  orgSettingsModuleName,
  proPackModuleName,
])
  .component('fileSharingControlSetting', new FileSharingControlSettingComponent())
  .name;
