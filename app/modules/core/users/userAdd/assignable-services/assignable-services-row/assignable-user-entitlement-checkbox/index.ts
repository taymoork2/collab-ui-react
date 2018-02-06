import './assignable-user-entitlement-checkbox.scss';

import { AssignableUserEntitlementCheckboxComponent } from './assignable-user-entitlement-checkbox.component';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row.assignable-user-entitlement-checkbox', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('assignableUserEntitlementCheckbox', new AssignableUserEntitlementCheckboxComponent())
  .name;
