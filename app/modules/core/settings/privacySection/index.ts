
import { SupportAccessSettingComponent } from './supportAccess.component';
import { CrashReportSettingComponent } from './crashReport.component';
import { PrivacySettingsComponent } from './privacySettings.component';

import notificationModule from 'modules/core/notifications';

export default angular.module('core.settings.privacy', [
  require('angular-cache'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/authinfo'),
  require('modules/core/scripts/services/org.service'),
  notificationModule,
])
  .component('privacySetting', new PrivacySettingsComponent())
  .component('crashReportSetting', new CrashReportSettingComponent())
  .component('supportAccessSetting', new SupportAccessSettingComponent())
  .name;
