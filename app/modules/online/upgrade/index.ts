import * as analytics from 'modules/core/analytics';
import { OnlineUpgradeComponent } from './upgradeModal.component';
import digitalRiverModule from 'modules/online/digitalRiver/index';
import subscriptionUpgradeButtonModule from 'modules/bmmp/subscriptionUpgradeButton';
import onlineUpgradeSharedModule from './shared';
import notifications from 'modules/core/notifications';
import accountExpiredModalModuleName from './account-expired-modal';

require('./upgradeModal.scss');

export default angular
  .module('online.upgrade', [
    require('@collabui/collab-ui-ng').default,
    analytics,
    subscriptionUpgradeButtonModule,
    require('angular-resource'),
    require('modules/core/auth/auth'),
    require('modules/core/config/urlConfig'),
    digitalRiverModule,
    notifications,
    onlineUpgradeSharedModule,
    accountExpiredModalModuleName,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/featureToggle').default,
  ])
  .component('onlineUpgradeModal', new OnlineUpgradeComponent())
  .name;
