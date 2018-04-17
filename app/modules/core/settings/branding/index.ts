import { BrandingSettingComponent } from './brandingSetting.component';
import { DeviceBrandingSettingComponent } from './device-branding-setting.component';
import notificationModule from 'modules/core/notifications';
import * as coreUrlConfigModule from 'modules/core/config/urlConfig';
import featureToggleModule from 'modules/core/featureToggle';
import './_device-branding.scss';
import { BrandingSettingWrapperComponent } from './branding-settings-wrapper.component';
import { FileDropComponent } from './file-drop.component';

export default angular.module('core.settings.branding', [
  'Squared',
  require('angular-cache'),
  require('modules/ediscovery/bytes_filter'),
  require('modules/core/scripts/services/authinfo'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/org.service'),
  require('modules/core/scripts/services/logmetricsservice'),
  require('modules/core/partnerProfile/branding').default,
  require('ng-file-upload'),
  featureToggleModule,
  notificationModule,
  coreUrlConfigModule,
])
  .component('brandingSetting', new BrandingSettingComponent())
  .component('deviceBrandingSetting', new DeviceBrandingSettingComponent())
  .component('brandingSettingWrapper', new BrandingSettingWrapperComponent())
  .component('fileDrop', new FileDropComponent())
  .name;
