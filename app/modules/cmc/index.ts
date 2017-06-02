import { CmcDetailsHeaderComponent } from './details/cmc-details-header.component';
import { CmcDetailsStatusComponent } from './status/cmc-details-status.component';
import { CmcDetailsSettingsComponent } from './settings/cmc-details-settings.component';

import UserDetailsModule from './user-menu/index';

import { CmcService } from './cmc.service';
import { CmcServiceMock } from './cmc.service-mock';

import './cmc.scss';
let orgServiceModule = require('modules/core/scripts/services/org.service');

export default angular
  .module('cmc', [
    UserDetailsModule,
    orgServiceModule,
    require('scripts/app.templates'),
  ])
  .component('cmcDetailsHeader', new CmcDetailsHeaderComponent())
  .component('cmcDetailsStatus', new CmcDetailsStatusComponent())
  .component('cmcDetailsSettings', new CmcDetailsSettingsComponent())
  .service('CmcService', CmcService)
  .service('CmcServiceMock', CmcServiceMock)
  .name;
