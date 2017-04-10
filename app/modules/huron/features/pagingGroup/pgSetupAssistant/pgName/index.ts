import { PgNameComponent } from './pgName.component';

export default angular
  .module('huron.paging-group.name', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('pgName',  new PgNameComponent())
  .name;
