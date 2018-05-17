import './auto-assign-license-summary.scss';

import { AutoAssignLicenseSummaryComponent } from './auto-assign-license-summary.component';

import autoAssignTemplateSummaryContainerModuleName from 'modules/core/users/userManage/shared/auto-assign-template-summary-container';

export default angular.module('core.users.userManage.dir-sync.auto-assign-license-summary', [
  autoAssignTemplateSummaryContainerModuleName,
])
  .component('userManageDirSyncAutoAssignLicenseSummary', new AutoAssignLicenseSummaryComponent())
  .name;
