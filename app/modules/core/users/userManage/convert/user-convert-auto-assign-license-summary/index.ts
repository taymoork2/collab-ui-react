import './user-convert-auto-assign-license-summary.scss';

import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import licenseSummaryModalBodyModuleName from 'modules/core/users/userManage/shared/license-summary-modal-body';

import { UserConvertAutoAssignLicenseSummaryComponent } from './user-convert-auto-assign-license-summary.component';

export default angular.module('core.users.userManage.convert.user-convert-auto-assign-license-summary', [
  require('angular-ui-router'),
  licenseSummaryModalBodyModuleName,
  multiStepModalModuleName,
])
  .component('userConvertAutoAssignLicenseSummary', new UserConvertAutoAssignLicenseSummaryComponent())
  .name;
