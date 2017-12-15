import { CrUsersErrorResultsComponent } from './cr-users-error-results.component';

export default angular.module('core.users.shared.cr-users-error-results', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('crUsersErrorResults', new CrUsersErrorResultsComponent())
  .name;
