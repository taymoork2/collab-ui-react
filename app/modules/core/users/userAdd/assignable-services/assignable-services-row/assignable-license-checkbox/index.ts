import './assignable-license-checkbox.scss';

import { AssignableLicenseCheckboxComponent } from './assignable-license-checkbox.component';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row.assignable-license-checkbox', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('assignableLicenseCheckbox', new AssignableLicenseCheckboxComponent())
  .name;
