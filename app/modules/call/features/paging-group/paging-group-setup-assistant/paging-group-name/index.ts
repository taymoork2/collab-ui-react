import { PgNameComponent } from './paging-group-name.component';

export default angular
  .module('call.paging-group.name', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('angular-sanitize'),
  ])
  .component('pgName',  new PgNameComponent())
  .name;
