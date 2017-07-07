import { CmcUserDetailsComponent } from './user-details.component';
import { CmcUserDetailsSettingsComponent } from './user-details-settings.component';

import notificationModule from 'modules/core/notifications/index';

const orgServiceModule = require('modules/core/scripts/services/org.service');

export default angular
  .module('cmc.user-details', [
    notificationModule,
    orgServiceModule,
    require('scripts/app.templates'),
  ])
  .component('cmcUserDetails', new CmcUserDetailsComponent())
  .component('cmcUserDetailsSettings', new CmcUserDetailsSettingsComponent())
  .name;
