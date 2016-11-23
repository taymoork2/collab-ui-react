import { BulkEnableVmComponent } from './bulkEnableVm.component';
import { BulkEnableVmService } from './bulkEnableVm.service';
export * from './bulkEnableVm.service';
    require('./bulkEnableVm.scss');

export default angular
  .module('huron.bulk-enable-vm', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/userlist.service'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/users/userCsv/userCsv.service'),
  ])
  .component('ucBulkEnableVm', new BulkEnableVmComponent())
  .service('BulkEnableVmService', BulkEnableVmService)
  .name;
