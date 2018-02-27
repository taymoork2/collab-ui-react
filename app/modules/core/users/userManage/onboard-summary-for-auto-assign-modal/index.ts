import './onboard-summary-for-auto-assign-modal.scss';

import * as analyticsModuleName from 'modules/core/analytics';
import coreSharedModuleName from 'modules/core/shared';
import autoAssignTemplateSummaryContainerModuleName from 'modules/core/users/userManage/shared/auto-assign-template-summary-container';
import notificationsModuleName from 'modules/core/notifications';
import onboardModuleName from 'modules/core/users/shared/onboard';
import userAddSharedModuleName from 'modules/core/users/userAdd/shared';
import { OnboardSummaryForAutoAssignModalComponent } from './onboard-summary-for-auto-assign-modal.component';

export default angular.module('core.users.userManage.onboard-summary-for-auto-assign-modal', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  analyticsModuleName,
  coreSharedModuleName,
  autoAssignTemplateSummaryContainerModuleName,
  notificationsModuleName,
  onboardModuleName,
  userAddSharedModuleName,
])
  .component('onboardSummaryForAutoAssignModal', new OnboardSummaryForAutoAssignModalComponent())
  .name;
