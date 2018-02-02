import './edit-summary-auto-assign-template-modal.scss';

import * as analyticsModuleName from 'modules/core/analytics';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import notificationModuleName from 'modules/core/notifications';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';
import licenseSummaryModalBodyModuleName from 'modules/core/users/userManage/shared/license-summary-modal-body';

import { EditSummaryAutoAssignTemplateModalComponent } from './edit-summary-auto-assign-template-modal.component';

export default angular.module('core.users.userManage.edit-summary-auto-assign-template-modal', [
  analyticsModuleName,
  multiStepModalModuleName,
  notificationModuleName,
  usersSharedAutoAssignTemplateModuleName,
  licenseSummaryModalBodyModuleName,
])
  .component('editSummaryAutoAssignTemplateModal', new EditSummaryAutoAssignTemplateModalComponent())
  .name;
