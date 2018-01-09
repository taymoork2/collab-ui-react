import { CrOnboardUsersComponent } from './cr-onboard-users.component';

export default angular.module('core.users.userAdd.users-add-modal.cr-onboard-users', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('crOnboardUsers', new CrOnboardUsersComponent())
  .name;
