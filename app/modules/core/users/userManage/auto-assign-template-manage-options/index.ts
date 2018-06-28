import './auto-assign-template-manage-options.scss';

import { AutoAssignTemplateManageOptionsComponent } from './auto-assign-template-manage-options.component';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';
import modalModuleName from 'modules/core/modal';
import notificationModuleName from 'modules/core/notifications';

export default angular.module('core.users.userManage.auto-assign-template-manage-options', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/accessibility/three-dot-dropdown').default,
  usersSharedAutoAssignTemplateModuleName,
  modalModuleName,
  notificationModuleName,
])
  .component('autoAssignTemplateManageOptions', new AutoAssignTemplateManageOptionsComponent())
  .name;
