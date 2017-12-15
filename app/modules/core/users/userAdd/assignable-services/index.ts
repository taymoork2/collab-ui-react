import './assignable-services.scss';

import { AssignableServicesComponent } from './assignable-services.component';
import * as orgServiceModuleName from 'modules/core/scripts/services/org.service';
import sharedModuleName from './shared';
import assignableServicesRowModuleName from './assignable-services-row';

export default angular.module('core.users.userAdd.assignable-services', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  orgServiceModuleName,
  sharedModuleName,
  assignableServicesRowModuleName,
])
  .component('assignableServices', new AssignableServicesComponent())
  .name;
