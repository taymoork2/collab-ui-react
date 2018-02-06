import { WebexSiteManagementComponent } from './webexSiteManagementSetting.component';
import notificationModule from 'modules/core/notifications';
import featureToggleModule from 'modules/core/featureToggle';
import * as authinfoModule from 'modules/core/scripts/services/authinfo';
import * as orgServiceModule from 'modules/core/scripts/services/org.service';

export default angular.module('core.settings.webexSiteManagement', [
  require('@collabui/collab-ui-ng').default,
  orgServiceModule,
  authinfoModule,
  notificationModule,
  featureToggleModule,
])
  .component('webexSiteManagementSetting', new WebexSiteManagementComponent())
  .name;
