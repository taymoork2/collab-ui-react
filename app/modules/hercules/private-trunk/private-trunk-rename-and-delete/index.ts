import { PrivateTrunkSettingsPageComponent } from './private-trunk-settings-page.component';
import './_private-trunk-settings-page.scss';

export default angular
  .module('Hercules')
  .component('privateTrunkSettingsPage', new PrivateTrunkSettingsPageComponent())
  .name;
