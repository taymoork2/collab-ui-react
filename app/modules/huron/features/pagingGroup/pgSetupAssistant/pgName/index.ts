import { PgNameComponent } from './pgName.component';

export default angular
  .module('huron.paging-group.name', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('pgName',  new PgNameComponent())
  .name;
