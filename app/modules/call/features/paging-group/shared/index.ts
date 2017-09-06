import { PagingGroupService } from './paging-group.service';
import { PagingNumberService } from './paging-group-number.service';
import notificationModule from 'modules/core/notifications';
import numberModule from 'modules/huron/numbers';

export * from './paging-group';
export { PagingGroupService };
export { PagingNumberService };

export default angular
  .module('call.features.paging-group.services', [
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    notificationModule,
    numberModule,
  ])
  .service('PagingGroupService', PagingGroupService)
  .service('PagingNumberService', PagingNumberService)
  .name;
