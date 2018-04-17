import { DomainsSettingComponent } from './domainsSetting.component';

export default angular.module('core.settings.domain', [
  require('angular-cache'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/org.service'),
  require('modules/core/domainManagement').default,
])
  .component('domainsSetting', new DomainsSettingComponent())
  .name;
