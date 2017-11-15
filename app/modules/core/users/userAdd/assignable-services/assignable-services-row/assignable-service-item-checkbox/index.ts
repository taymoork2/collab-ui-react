import './assignable-service-item-checkbox.scss';

import { AssignableServiceItemCheckboxComponent } from './assignable-service-item-checkbox.component';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row.assignable-service-item-checkbox', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('assignableServiceItemCheckbox', new AssignableServiceItemCheckboxComponent())
  .name;
