import './assignable-services-row.scss';

import { AssignableServicesRowComponent } from './assignable-services-row.component';
import assignableAdvancedMeetingsModuleName from './assignable-advanced-meetings';
import assignableLicenseCheckboxModuleName from './assignable-license-checkbox';
import crCollapsibleRowModuleName from 'modules/core/users/shared/cr-collapsible-row';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  assignableAdvancedMeetingsModuleName,
  assignableLicenseCheckboxModuleName,
  crCollapsibleRowModuleName,
])
  .component('assignableServicesRow', new AssignableServicesRowComponent())
  .name;
