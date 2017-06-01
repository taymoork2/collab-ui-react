import './_paging-group.scss';

import { PagingGroupService } from './pagingGroup.service';
import { PagingNumberService } from './pgNumber.service';

import notifications from 'modules/core/notifications';

export * from './pagingGroup';
export * from './pagingGroup.service';
export * from './pgNumber.service';

export default angular
  .module('huron.paging-group', [
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    notifications,
  ])
  .service('PagingGroupService', PagingGroupService)
  .service('PagingNumberService', PagingNumberService)
  .name;
