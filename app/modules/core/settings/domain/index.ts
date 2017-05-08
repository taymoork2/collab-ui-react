import { DomainsSettingComponent } from './domainsSetting.component';

export default angular.module('core.settings.branding', [
  require('angular-cache'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('collab-ui-ng').default,
  require('scripts/app.templates'),
  require('modules/core/scripts/services/org.service'),
])
  .component('domainsSetting', new DomainsSettingComponent())
  .name;
