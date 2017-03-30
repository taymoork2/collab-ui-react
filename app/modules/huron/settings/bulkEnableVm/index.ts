import { BulkEnableVmComponent } from './bulkEnableVm.component';
import { BulkEnableVmService } from './bulkEnableVm.service';
import featureToggleModule from 'modules/core/featureToggle';
export * from './bulkEnableVm.service';
require('./bulkEnableVm.scss');

export default angular
  .module('huron.bulk-enable-vm', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    featureToggleModule,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/userlist.service'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/users/userCsv/userCsv.service'),
  ])
  .component('ucBulkEnableVm', new BulkEnableVmComponent())
  .service('BulkEnableVmService', BulkEnableVmService)
  .name;
