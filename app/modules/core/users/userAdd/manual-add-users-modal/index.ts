import './manual-add-users-modal.scss';

import { ManualAddUsersModalComponent } from './manual-add-users-modal.component';
import crOnboardUsersModuleName from './cr-onboard-users';

export default angular.module('core.users.userAdd.manual-add-users-modal', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  crOnboardUsersModuleName,
])
  .component('manualAddUsersModal', new ManualAddUsersModalComponent())
  .name;
