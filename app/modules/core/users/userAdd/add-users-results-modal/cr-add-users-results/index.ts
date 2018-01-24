import { CrAddUsersResultsComponent } from './cr-add-users-results.component';

export default angular.module('core.users.userAdd.add-users-results-modal.cr-add-users-results', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('crAddUsersResults', new CrAddUsersResultsComponent())
  .name;
