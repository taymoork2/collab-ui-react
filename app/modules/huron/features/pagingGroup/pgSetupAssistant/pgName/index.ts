import { PgNameComponent } from './pgName.component';

export default angular
  .module('huron.paging-group.name', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'ngSanitize',
  ])
  .component('pgName',  new PgNameComponent())
  .name;
