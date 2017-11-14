import { AssignableServicesComponent } from './assignable-services.component';

export default angular.module('core.users.userAdd.assignable-services', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('assignableServices', new AssignableServicesComponent())
  .name;
