import { Office365SettingsPageComponent } from './office-365-settings-page.component';

require('./office-365-settings-page.scss');

export default angular
  .module('hercules.office-365-settings-page', [
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/hercules/services/uss.service').default,
  ])
  .component('office365SettingsPage', new Office365SettingsPageComponent())
  .name;
