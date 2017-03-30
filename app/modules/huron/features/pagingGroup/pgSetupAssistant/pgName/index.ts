import { PgNameComponent } from './pgName.component';

export default angular
  .module('huron.paging-group.name', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
  ])
  .component('pgName',  new PgNameComponent())
  .name;
