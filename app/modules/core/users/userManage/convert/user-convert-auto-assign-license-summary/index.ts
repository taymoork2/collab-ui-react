import './user-convert-auto-assign-license-summary.scss';

import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import autoAssignTemplateSummaryContainerModuleName from 'modules/core/users/userManage/shared/auto-assign-template-summary-container';

import { UserConvertAutoAssignLicenseSummaryComponent } from './user-convert-auto-assign-license-summary.component';

export default angular.module('core.users.userManage.convert.user-convert-auto-assign-license-summary', [
  require('angular-ui-router'),
  autoAssignTemplateSummaryContainerModuleName,
  multiStepModalModuleName,
])
  .component('userConvertAutoAssignLicenseSummary', new UserConvertAutoAssignLicenseSummaryComponent())
  .name;
