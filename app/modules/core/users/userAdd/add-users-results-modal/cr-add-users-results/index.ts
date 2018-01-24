import { CrAddUsersResultsComponent } from './cr-add-users-results.component';
import * as analyticsModuleName from 'modules/core/analytics';
import userAddSharedModuleName from 'modules/core/users/userAdd/shared';

export default angular.module('core.users.userAdd.add-users-results-modal.cr-add-users-results', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  analyticsModuleName,
  userAddSharedModuleName,
])
  .component('crAddUsersResults', new CrAddUsersResultsComponent())
  .name;
