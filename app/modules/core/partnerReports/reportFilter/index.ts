import { ReportFilterComponent } from './reportFilter.component';

export default angular
  .module('reports.reportFilter', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
  ])
  .component('reportFilter', new ReportFilterComponent())
  .name;
