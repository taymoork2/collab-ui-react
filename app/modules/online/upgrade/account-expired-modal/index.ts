import './account-expired-modal.scss';

import { AccountExpiredModalComponent } from './account-expired-modal.component';
import organizationDeleteModule from 'modules/core/organizations/organization-delete';
import onlineUpgradeSharedModule from 'modules/online/upgrade/shared';

export default angular.module('online.upgrade.account-expired-modal', [
  organizationDeleteModule,
  onlineUpgradeSharedModule,
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('accountExpiredModal', new AccountExpiredModalComponent())
  .name;
