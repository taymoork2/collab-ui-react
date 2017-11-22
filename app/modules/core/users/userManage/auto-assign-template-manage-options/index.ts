import './auto-assign-template-manage-options.scss';

import { AutoAssignTemplateManageOptionsComponent } from './auto-assign-template-manage-options.component';

export default angular.module('core.users.userManage.auto-assign-template-manage-options', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('autoAssignTemplateManageOptions', new AutoAssignTemplateManageOptionsComponent())
  .name;
