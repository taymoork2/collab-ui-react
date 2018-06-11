
import { ExternalCommunicationSettingComponent } from './external-communication-setting.component';

import notificationModuleName from 'modules/core/notifications';
import orgSettingsModuleName from 'modules/core/shared/org-settings';
import proPackModuleName from 'modules/core/proPack';

export default angular.module('core.settings.externalCommunication', [
  require('angular-cache'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/authinfo'),
  notificationModuleName,
  orgSettingsModuleName,
  proPackModuleName,
])
  .component('externalCommunicationSetting', new ExternalCommunicationSettingComponent())
  .name;
