import { UserManageEmailSuppressComponent } from './emailSuppress.component';
import { UserManageEmailSuppressController } from './emailSuppress.controller';
import './emailSuppress.scss';

export default angular.module('core.users.userManage.emailSuppress', [
  require('angular-cache'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/analytics'),
  require('modules/core/scripts/services/org.service'),
])
  .component('userManageEmailSuppress', new UserManageEmailSuppressComponent())
  .controller('UserManageEmailSuppressController', UserManageEmailSuppressController)
  .name;
