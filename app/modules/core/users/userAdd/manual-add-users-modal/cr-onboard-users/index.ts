import dirSyncServiceModuleName from 'modules/core/featureToggle';
import userAddSharedModuleName from 'modules/core/users/userAdd/shared';
import * as userlistModuleName from 'modules/core/scripts/services/userlist.service';
import { CrOnboardUsersComponent } from './cr-onboard-users.component';

export default angular.module('core.users.userAdd.users-add-modal.cr-onboard-users', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  dirSyncServiceModuleName,
  userAddSharedModuleName ,
  userlistModuleName,
])
  .component('crOnboardUsers', new CrOnboardUsersComponent())
  .name;
