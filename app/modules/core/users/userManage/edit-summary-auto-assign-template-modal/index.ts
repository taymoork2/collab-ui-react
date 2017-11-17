import './edit-summary-auto-assign-template-modal.scss';

import { EditSummaryAutoAssignTemplateModalComponent } from './edit-summary-auto-assign-template-modal.component';

export default angular.module('core.users.userManage.edit-summary-auto-assign-template-modal', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('editSummaryAutoAssignTemplateModal', new EditSummaryAutoAssignTemplateModalComponent())
  .name;
