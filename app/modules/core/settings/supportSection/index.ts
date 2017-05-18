
import { SupportSettingComponent } from './supportSetting.component';

import notificationModule from 'modules/core/notifications';
import featureToggleModule from 'modules/core/featureToggle';

export default angular.module('core.settings.support', [
  require('angular-cache'),
  require('scripts/app.templates'),
  require('collab-ui-ng').default,
  require('modules/core/scripts/services/org.service'),
  require('modules/core/scripts/services/userlist.service'),
  require('modules/core/scripts/services/brand.service'),
  require('modules/webex/webexClientVersions/webexClientVersion.svc'),
  notificationModule,
  featureToggleModule,
])
  .component('supportSetting', new SupportSettingComponent())
  .name;
