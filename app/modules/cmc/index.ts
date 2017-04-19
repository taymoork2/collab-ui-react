import { CmcUserDetailsComponent } from './user-details.component';
import { CmcUserDetailsSettingsComponent } from './user-details-settings.component';

export default angular
  .module('cmc', [])
  //.component('cmcUserDetailsSettings', new CmcUserDetailsSettingsComponent())
  .component('cmcUserDetails', new CmcUserDetailsComponent())
  .component('cmcUserDetailsSettings', new CmcUserDetailsSettingsComponent())
  .name;
