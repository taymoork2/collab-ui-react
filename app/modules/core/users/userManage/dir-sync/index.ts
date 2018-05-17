const UserManageDirSyncController = require('./user-manage-dir-sync.controller');

import './dir-sync.scss';

import * as analyticsModuleName from 'modules/core/analytics';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import featureToggleModuleName from 'modules/core/featureToggle';
import notificationsModuleName from 'modules/core/notifications';
import autoAssignLicenseSummaryModuleName from './auto-assign-license-summary';

export default angular.module('core.users.userManage.dir-sync', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  analyticsModuleName,
  authinfoModuleName,
  featureToggleModuleName,
  notificationsModuleName,
  autoAssignLicenseSummaryModuleName,
])
  .controller('UserManageDirSyncController', UserManageDirSyncController)
  .name;
