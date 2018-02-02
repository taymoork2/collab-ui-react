import licenseSummaryModuleName from './license-summary';
import { UserManageService } from './user-manage.service';
import * as analyticsModuleName from 'modules/core/analytics';
import featureToggleModuleName from 'modules/core/featureToggle';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';
import licenseSummaryModalBodyModuleName from './license-summary-modal-body';

export {
  UserManageService,
};

export default angular
  .module('core.users.userManage.shared', [
    require('angular-ui-router'),
    require('@collabui/collab-ui-ng').default,
    analyticsModuleName,
    featureToggleModuleName,
    licenseSummaryModuleName,
    usersSharedAutoAssignTemplateModuleName,
    licenseSummaryModalBodyModuleName,
  ])
  .service('UserManageService', UserManageService)
  .name;
