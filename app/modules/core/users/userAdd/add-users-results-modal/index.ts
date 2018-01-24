import './add-users-results-modal.scss';

import { AddUsersResultsModalComponent } from './add-users-results-modal.component';
import crAddUsersResultsModuleName from './cr-add-users-results';
export default angular.module('core.users.userAdd.add-users-results-modal', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  crAddUsersResultsModuleName,
])
  .component('addUsersResultsModal', new AddUsersResultsModalComponent())
  .name;
