import { AssignableServicesComponent } from './assignable-services.component';
import sharedModuleName from './shared';
import assignableServicesRowModuleName from './assignable-services-row';

export default angular.module('core.users.userAdd.assignable-services', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  sharedModuleName,
  assignableServicesRowModuleName,
])
  .component('assignableServices', new AssignableServicesComponent())
  .name;
