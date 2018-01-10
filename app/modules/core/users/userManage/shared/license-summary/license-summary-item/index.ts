import './license-summary-item.scss';

import { LicenseSummaryItemComponent } from './license-summary-item.component';

export default angular.module('core.users.userManage.shared.license-summary.license-summary-item', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('licenseSummaryItem', new LicenseSummaryItemComponent())
  .name;
