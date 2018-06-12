import { ReactivateUserModalComponent } from './reactivate-user-modal.component';

export default angular
  .module('hercules.reactivate-user-modal', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('reactivateUserModal', new ReactivateUserModalComponent())
  .name;
