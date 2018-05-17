import './edit-summary-auto-assign-template-modal.scss';

import * as analyticsModuleName from 'modules/core/analytics';
import coreSharedModuleName from 'modules/core/shared';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import notificationModuleName from 'modules/core/notifications';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';
import autoAssignTemplateSummaryContainerModuleName from 'modules/core/users/userManage/shared/auto-assign-template-summary-container';

import { EditSummaryAutoAssignTemplateModalComponent } from './edit-summary-auto-assign-template-modal.component';

export default angular.module('core.users.userManage.edit-summary-auto-assign-template-modal', [
  analyticsModuleName,
  coreSharedModuleName,
  multiStepModalModuleName,
  notificationModuleName,
  usersSharedAutoAssignTemplateModuleName,
  autoAssignTemplateSummaryContainerModuleName,
])
  .component('editSummaryAutoAssignTemplateModal', new EditSummaryAutoAssignTemplateModalComponent())
  .name;
