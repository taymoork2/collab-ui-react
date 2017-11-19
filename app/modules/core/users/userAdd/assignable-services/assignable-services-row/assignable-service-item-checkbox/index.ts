import './assignable-service-item-checkbox.scss';

import { AssignableServiceItemCheckboxComponent } from './assignable-service-item-checkbox.component';
import sharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row.assignable-service-item-checkbox', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  sharedModuleName,
])
  .component('assignableServiceItemCheckbox', new AssignableServiceItemCheckboxComponent())
  .name;
