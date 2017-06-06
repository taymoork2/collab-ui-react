import { ImpSettingsPageComponent } from './imp-settings-page.component';

require('./_imp-settings-page.scss');

export default angular
  .module('Hercules')
  .component('impSettingsPage', new ImpSettingsPageComponent())
  .name;
