import { OnlineUpgradeComponent } from './upgradeModal.component';
import { OnlineUpgradeService } from './upgrade.service';
import subscriptionUpgradeButtonModule from 'modules/bmmp/subscriptionUpgradeButton';
import notifications from 'modules/core/notifications';

require('./upgradeModal.scss');

export * from './upgrade.service';

export default angular
  .module('online.upgrade', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    subscriptionUpgradeButtonModule,
    require('angular-resource'),
    require('modules/core/auth/auth'),
    require('modules/core/config/urlConfig'),
    notifications,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/featureToggle').default,
  ])
  .component('onlineUpgradeModal', new OnlineUpgradeComponent())
  .service('OnlineUpgradeService', OnlineUpgradeService)
  .name;
