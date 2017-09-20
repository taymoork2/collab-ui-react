import { ReportFilterComponent } from './reportFilter.component';

export default angular
  .module('reports.reportFilter', [
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('reportFilter', new ReportFilterComponent())
  .name;
