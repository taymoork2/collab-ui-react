import { Office365SettingsPageComponent } from './office-365-settings-page.component';

require('./office-365-settings-page.scss');

export default angular
  .module('Hercules')
  .component('office365SettingsPage', new Office365SettingsPageComponent())
  .name;
