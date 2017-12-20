import './license-summary.scss';

import { LicenseSummaryComponent } from './license-summary.component';
import licenseSummaryItemModuleName from './license-summary-item';
import sharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';

export default angular.module('core.users.userManage.shared.license-summary', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  licenseSummaryItemModuleName,
  sharedModuleName,
])
  .component('licenseSummary', new LicenseSummaryComponent())
  .name;
