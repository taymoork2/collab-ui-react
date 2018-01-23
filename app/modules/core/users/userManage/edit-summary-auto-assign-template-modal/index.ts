import './edit-summary-auto-assign-template-modal.scss';

import * as analyticsModuleName from 'modules/core/analytics';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import notificationModuleName from 'modules/core/notifications';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';
import { EditSummaryAutoAssignTemplateModalComponent } from './edit-summary-auto-assign-template-modal.component';
import assignableServicesSharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';
import userManageSharedModuleName from 'modules/core/users/userManage/shared';

// TODO seems like a lot of unnecessary import dependencies
export default angular.module('core.users.userManage.edit-summary-auto-assign-template-modal', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  analyticsModuleName,
  authInfoModuleName,
  multiStepModalModuleName,
  notificationModuleName,
  urlConfigModuleName,
  usersSharedAutoAssignTemplateModuleName,
  assignableServicesSharedModuleName,
  userManageSharedModuleName,
])
  .component('editSummaryAutoAssignTemplateModal', new EditSummaryAutoAssignTemplateModalComponent())
  .name;
