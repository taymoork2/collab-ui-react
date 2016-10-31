import { PagingGroupService } from './pagingGroup.service';
import { PagingNumberService } from './pgNumber.service';

export * from './pagingGroup';
export * from './pagingGroup.service';
export * from './pgNumber.service';

export default angular
  .module('huron.paging-group', [
    'atlas.templates',
    'collab.ui',
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .service('PagingGroupService', PagingGroupService)
  .service('PagingNumberService', PagingNumberService)
  .name;
