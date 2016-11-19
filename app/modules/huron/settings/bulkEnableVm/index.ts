import { BulkEnableVmService } from './bulkEnableVm.service';

export default angular
  .module('huron.bulkEnableVm', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/userlist.service'),
    require('modules/huron/telephony/cmiServices'),
  ])
  .service('BulkEnableVmService', BulkEnableVmService)
  .name;
