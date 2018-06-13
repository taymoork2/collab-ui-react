import { ReactivateUserModalLinkComponent } from './reactivate-user-modal-link.component';

export default angular
  .module('hercules.reactivate-user-modal-link', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('reactivateUserModalLink', new ReactivateUserModalLinkComponent())
  .name;
