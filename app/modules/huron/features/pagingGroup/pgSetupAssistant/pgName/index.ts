import { PgNameComponent } from './pgName.component';

export default angular
  .module('huron.paging-group.name', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
  ])
  .component('pgName',  new PgNameComponent())
  .name;
