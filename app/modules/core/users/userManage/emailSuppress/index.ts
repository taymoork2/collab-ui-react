import { UserManageEmailSuppressComponent } from './emailSuppress.component';
import { UserManageEmailSuppressController } from './emailSuppress.controller';
import userManageSharedModuleName from '../shared';
import './emailSuppress.scss';

export default angular.module('core.users.userManage.emailSuppress', [
  require('angular-cache'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/analytics'),
  require('modules/core/scripts/services/org.service'),
  userManageSharedModuleName,
])
  .component('userManageEmailSuppress', new UserManageEmailSuppressComponent())
  .controller('UserManageEmailSuppressController', UserManageEmailSuppressController)
  .name;
