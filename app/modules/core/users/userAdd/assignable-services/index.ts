import { AssignableServicesComponent } from './assignable-services.component';
import sharedModuleName from './shared';

export default angular.module('core.users.userAdd.assignable-services', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  sharedModuleName,
])
  .component('assignableServices', new AssignableServicesComponent())
  .name;
