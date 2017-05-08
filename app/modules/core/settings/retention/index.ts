
import { RetentionSettingComponent } from './retentionSetting.component';

import notificationModule from 'modules/core/notifications';

export default angular.module('core.settings.retention', [
  require('angular-cache'),
  require('scripts/app.templates'),
  require('collab-ui-ng').default,
  require('modules/core/scripts/services/retention.service'),
  require('modules/core/scripts/services/authinfo'),
  notificationModule,
])
  .component('retentionSetting', new RetentionSettingComponent())
  .name;
