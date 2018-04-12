require('./admin-elevation.scss');
import { AdminElevationService } from './admin-elevation.service';

import { HelpdeskAdminElevationComponent } from './admin-elevation.component';

export default angular
  .module('helpdesk.admin-elevation', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('helpdeskAdminElevation', new HelpdeskAdminElevationComponent())
  .service('AdminElevationService', AdminElevationService)
  .name;
