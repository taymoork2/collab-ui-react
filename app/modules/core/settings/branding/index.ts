import { BrandingSettingComponent } from './brandingSetting.component';

export default angular.module('core.settings.branding', [
  require('angular-cache'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('collab-ui-ng').default,
  require('scripts/app.templates'),
  require('modules/core/scripts/services/org.service'),
])
  .component('brandingSetting', new BrandingSettingComponent())
  .name;
