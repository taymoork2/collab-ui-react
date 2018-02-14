import './auto-assign-template-summary-item.scss';

import { AutoAssignTemplateSummaryItemComponent } from './auto-assign-template-summary-item.component';

export default angular.module('core.users.userManage.shared.auto-assign-template-summary.auto-assign-template-summary-item', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('autoAssignTemplateSummaryItem', new AutoAssignTemplateSummaryItemComponent())
  .name;
