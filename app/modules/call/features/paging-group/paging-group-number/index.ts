import { PagingGroupNumberComponent } from './paging-group-number.component';

export default angular
  .module('call.features.paging-group-number', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucPagingGroupNumber', new PagingGroupNumberComponent())
  .name;
