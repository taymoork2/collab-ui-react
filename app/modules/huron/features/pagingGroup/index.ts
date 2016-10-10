import { PagingGroupService } from './pagingGroup.service';

export * from './pagingGroup';
export * from './pagingGroup.service';

export default angular
  .module('huron.paging-group', [
    'atlas.templates',
    'cisco.ui',
  ])
  .service('PagingGroupService', PagingGroupService)
  .name;
