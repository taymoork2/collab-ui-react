import { ReportFilterComponent } from './reportFilter.component';

export default angular
  .module('reports.reportFilter', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('reportFilter', new ReportFilterComponent())
  .name;
