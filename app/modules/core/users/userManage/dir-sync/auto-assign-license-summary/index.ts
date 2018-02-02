import './auto-assign-license-summary.scss';

import { AutoAssignLicenseSummaryComponent } from './auto-assign-license-summary.component';

import licenseSummaryModalBodyModuleName from 'modules/core/users/userManage/shared/license-summary-modal-body';

export default angular.module('core.users.userManage.dir-sync.auto-assign-license-summary', [
  licenseSummaryModalBodyModuleName,
])
  .component('userManageDirSyncAutoAssignLicenseSummary', new AutoAssignLicenseSummaryComponent())
  .name;
