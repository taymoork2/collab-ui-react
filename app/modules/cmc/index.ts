import { CmcUserDetailsComponent } from './user-details.component';
import { CmcUserDetailsSettingsComponent } from './user-details-settings.component';
import { CmcService } from './cmc.service';
import './cmc.scss';
let orgServiceModule = require('modules/core/scripts/services/org.service');

export default angular
  .module('cmc', [
    orgServiceModule,
  ])
  .component('cmcUserDetails', new CmcUserDetailsComponent())
  .component('cmcUserDetailsSettings', new CmcUserDetailsSettingsComponent())
  .service('CmcService', CmcService)
  .name;
