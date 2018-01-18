import './edit-auto-assign-template-modal.scss';

import { EditAutoAssignTemplateModalComponent } from './edit-auto-assign-template-modal.component';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import usersSharedModuleName from 'modules/core/users/shared';

export default angular.module('core.users.userManage.edit-auto-assign-template-modal', [
  require('angular-ui-router'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/analytics'),
  multiStepModalModuleName,
  usersSharedModuleName,
])
  .component('editAutoAssignTemplateModal', new EditAutoAssignTemplateModalComponent())
  .name;
