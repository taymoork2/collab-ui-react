import { OnlineUpgradeService } from './upgrade.service';
import digitalRiverModule from 'modules/online/digitalRiver/index';
import notifications from 'modules/core/notifications';

export * from './upgrade.service';

export default angular
  .module('online.upgrade,shared', [
    require('angular-resource'),
    require('modules/core/config/urlConfig'),
    require('@collabui/collab-ui-ng').default,
    digitalRiverModule,
    notifications,
    require('modules/core/scripts/services/authinfo'),
  ])
  .service('OnlineUpgradeService', OnlineUpgradeService)
  .name;
