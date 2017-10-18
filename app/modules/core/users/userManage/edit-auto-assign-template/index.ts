import './edit-auto-assign-template.scss';

import { EditAutoAssignTemplateComponent } from './edit-auto-assign-template.component';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';

export default angular.module('core.users.userManage.edit-auto-assign-template', [
  require('angular-ui-router'),
  require('angular-translate'),
  require('collab-ui-ng').default,
  require('modules/core/analytics'),
  multiStepModalModuleName,
])
  .component('editAutoAssignTemplate', new EditAutoAssignTemplateComponent())
  .name;
