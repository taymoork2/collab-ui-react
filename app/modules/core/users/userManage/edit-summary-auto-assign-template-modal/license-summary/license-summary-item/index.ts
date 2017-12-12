import './license-summary-item.scss';

import { LicenseSummaryItemComponent } from './license-summary-item.component';

export default angular.module('core.users.userManage.edit-summary-auto-assign-template-modal.license-summary.license-summary-item', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('licenseSummaryItem', new LicenseSummaryItemComponent())
  .name;
