import './auto-assign-template-summary.scss';

import { AutoAssignTemplateSummaryComponent } from './auto-assign-template-summary.component';
import autoAssignTemplateSummaryItemModuleName from './auto-assign-template-summary-item';
import sharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';

export default angular.module('core.users.userManage.shared.auto-assign-template-summary', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  autoAssignTemplateSummaryItemModuleName,
  sharedModuleName,
])
  .component('autoAssignTemplateSummary', new AutoAssignTemplateSummaryComponent())
  .name;
