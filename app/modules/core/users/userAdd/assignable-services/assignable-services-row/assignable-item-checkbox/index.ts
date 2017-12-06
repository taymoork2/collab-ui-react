import './assignable-item-checkbox.scss';

import { AssignableItemCheckboxComponent } from './assignable-item-checkbox.component';
import sharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row.assignable-item-checkbox', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  sharedModuleName,
])
  .component('assignableItemCheckbox', new AssignableItemCheckboxComponent())
  .name;
