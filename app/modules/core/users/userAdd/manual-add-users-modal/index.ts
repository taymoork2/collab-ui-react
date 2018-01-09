import './manual-add-users-modal.scss';

import { ManualAddUsersModalComponent } from './manual-add-users-modal.component';

export default angular.module('core.users.userAdd.manual-add-users-modal', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('manualAddUsersModal', new ManualAddUsersModalComponent())
  .name;
