
import { RetentionSettingComponent } from './retentionSetting.component';

import notificationModule from 'modules/core/notifications';
import ProPack from 'modules/core/proPack';

export default angular.module('core.settings.retention', [
  require('angular-cache'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/retention.service'),
  require('modules/core/scripts/services/authinfo'),
  ProPack,
  notificationModule,
])
  .component('retentionSetting', new RetentionSettingComponent())
  .name;
