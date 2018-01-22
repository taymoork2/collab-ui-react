import './auto-assign-license-summary.scss';

import { AutoAssignLicenseSummaryComponent } from './auto-assign-license-summary.component';

import licenseSummaryModuleName from 'modules/core/users/userManage/shared/license-summary';
import usersSharedModuleName from 'modules/core/users/shared';

export default angular.module('core.users.userManage.dir-sync.auto-assign-license-summary', [
  require('angular-translate'),
  licenseSummaryModuleName,
  usersSharedModuleName,
])
  .component('userManageDirSyncAutoAssignLicenseSummary', new AutoAssignLicenseSummaryComponent())
  .name;
