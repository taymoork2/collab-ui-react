import * as analyticsModuleName from 'modules/core/analytics';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import notificationModuleName from 'modules/core/notifications';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import usersSharedModuleName from 'modules/core/users/shared';
import { EditSummaryAutoAssignTemplateModalComponent } from './edit-summary-auto-assign-template-modal.component';
import licenseSummaryModuleName from './license-summary';
import assignableServicesSharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';

export default angular.module('core.users.userManage.edit-summary-auto-assign-template-modal', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  analyticsModuleName,
  authInfoModuleName,
  multiStepModalModuleName,
  notificationModuleName,
  urlConfigModuleName,
  usersSharedModuleName,
  licenseSummaryModuleName,
  assignableServicesSharedModuleName,
])
  .component('editSummaryAutoAssignTemplateModal', new EditSummaryAutoAssignTemplateModalComponent())
  .name;
