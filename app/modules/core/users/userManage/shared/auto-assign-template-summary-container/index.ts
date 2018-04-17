import './auto-assign-template-summary-container.scss';

import { AutoAssignTemplateSummaryContainerComponent } from './auto-assign-template-summary-container.component';

import autoAssignTemplateSummaryModuleName from 'modules/core/users/userManage/shared/auto-assign-template-summary';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';

export default angular.module('core.users.userManage.shared.auto-assign-template-summary-container', [
  require('angular-translate'),
  autoAssignTemplateSummaryModuleName,
  usersSharedAutoAssignTemplateModuleName,
])
  .component('autoAssignTemplateSummaryContainer', new AutoAssignTemplateSummaryContainerComponent())
  .name;
