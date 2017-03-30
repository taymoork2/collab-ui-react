import { ReportFilterComponent } from './reportFilter.component';

export default angular
  .module('reports.reportFilter', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('reportFilter', new ReportFilterComponent())
  .name;
