import './onboard-summary-for-auto-assign-modal.scss';

import { OnboardSummaryForAutoAssignModalComponent } from './onboard-summary-for-auto-assign-modal.component';

export default angular.module('core.users.userManage.onboard-summary-for-auto-assign-modal', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('onboardSummaryForAutoAssignModal', new OnboardSummaryForAutoAssignModalComponent())
  .name;
