require('./admin-elevation.scss');
import { AdminElevationService } from './admin-elevation.service';
import { HelpdeskAdminElevationComponent } from './admin-elevation.component';
import * as coreUrlConfigModule from 'modules/core/config/urlConfig';
import metricsModule from 'modules/core/metrics';

export default angular
  .module('helpdesk.admin-elevation', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    coreUrlConfigModule,
    metricsModule,
  ])
  .component('helpdeskAdminElevation', new HelpdeskAdminElevationComponent())
  .service('AdminElevationService', AdminElevationService)
  .name;
