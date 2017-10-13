import { SupportSettingComponent } from './supportSetting.component';

import featureToggleModule from 'modules/core/featureToggle';
import proPack from 'modules/core/proPack';
import notificationModule from 'modules/core/notifications';

export default angular.module('core.settings.support', [
  require('angular-cache'),
  require('collab-ui-ng').default,
  require('modules/core/scripts/services/org.service'),
  require('modules/core/scripts/services/userlist.service'),
  require('modules/core/scripts/services/brand.service'),
  require('modules/webex/webexClientVersions/webexClientVersion.svc'),
  featureToggleModule,
  proPack,
  notificationModule,
])
  .component('supportSetting', new SupportSettingComponent())
  .name;
