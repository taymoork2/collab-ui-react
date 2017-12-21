import './auto-assign-template-manage-options.scss';

import { AutoAssignTemplateManageOptionsComponent } from './auto-assign-template-manage-options.component';
import usersSharedModuleName from 'modules/core/users/shared';
import modalModuleName from 'modules/core/modal';
import notificationModuleName from 'modules/core/notifications';

export default angular.module('core.users.userManage.auto-assign-template-manage-options', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  usersSharedModuleName,
  modalModuleName,
  notificationModuleName,
])
  .component('autoAssignTemplateManageOptions', new AutoAssignTemplateManageOptionsComponent())
  .name;
