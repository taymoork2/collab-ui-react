import './license-summary-modal-body.scss';

import { LicenseSummaryModalBodyComponent } from './license-summary-modal-body.component';

import licenseSummaryModuleName from 'modules/core/users/userManage/shared/license-summary';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';

export default angular.module('core.users.userManage.shared.license-summary-modal-body', [
  require('angular-translate'),
  licenseSummaryModuleName,
  usersSharedAutoAssignTemplateModuleName,
])
  .component('licenseSummaryModalBody', new LicenseSummaryModalBodyComponent())
  .name;
