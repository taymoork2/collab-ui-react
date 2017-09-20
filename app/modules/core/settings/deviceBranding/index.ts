import { DeviceBrandingSettingComponent } from './device-branding-setting.component';
import './_device-branding.scss';

import notificationModule from 'modules/core/notifications';

import featureToggleModule from 'modules/core/featureToggle';

export default angular.module('core.settings.deviceBranding', [
  'Squared',
  require('angular-cache'),
  require('angular-translate'),
  require('collab-ui-ng').default,
  require('modules/core/scripts/services/logmetricsservice'),
  require('ng-file-upload'),
  featureToggleModule,
  notificationModule,
])
  .component('deviceBrandingSetting', new DeviceBrandingSettingComponent())
  .name;
