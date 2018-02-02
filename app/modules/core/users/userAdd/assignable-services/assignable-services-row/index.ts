import './assignable-services-row.scss';

import { AssignableServicesRowComponent } from './assignable-services-row.component';
import assignableAdvancedMeetingsModuleName from './assignable-advanced-meetings';
import assignableLicenseCheckboxModuleName from './assignable-license-checkbox';
import assignableUserEntitlementCheckboxModuleName from './assignable-user-entitlement-checkbox';
import crCollapsibleRowModuleName from 'modules/core/users/shared/cr-collapsible-row';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  assignableAdvancedMeetingsModuleName,
  assignableLicenseCheckboxModuleName,
  assignableUserEntitlementCheckboxModuleName,
  crCollapsibleRowModuleName,
])
  .component('assignableServicesRow', new AssignableServicesRowComponent())
  .name;
