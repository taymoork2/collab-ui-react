import { CmcUserDetailsComponent } from './user-details.component';
import { CmcUserDetailsSettingsComponent } from './user-details-settings.component';
import { CmcDetailsHeaderComponent } from './details/cmc-details-header.component';
import { CmcDetailsStatusComponent } from './status/cmc-details-status.component';
import { CmcDetailsSettingsComponent } from './settings/cmc-details-settings.component';

import { CmcService } from './cmc.service';
import './cmc.scss';
let orgServiceModule = require('modules/core/scripts/services/org.service');

export default angular
  .module('cmc', [
    orgServiceModule,
  ])
  .component('cmcUserDetails', new CmcUserDetailsComponent())
  .component('cmcUserDetailsSettings', new CmcUserDetailsSettingsComponent())
  .component('cmcDetailsHeader', new CmcDetailsHeaderComponent())
  .component('cmcDetailsStatus', new CmcDetailsStatusComponent())
  .component('cmcDetailsSettings', new CmcDetailsSettingsComponent())
  .service('CmcService', CmcService)
  .name;
