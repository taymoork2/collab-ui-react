import { CmcUserDetailsComponent } from './user-details.component';
import { CmcUserDetailsSettingsComponent } from './user-details-settings.component';
import { CmcService } from './cmc.service';

import './cmc.scss';

export default angular
  .module('cmc', [])
  .component('cmcUserDetails', new CmcUserDetailsComponent())
  .component('cmcUserDetailsSettings', new CmcUserDetailsSettingsComponent())
  .service('CmcService', CmcService)
  .name;
