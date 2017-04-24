import { ReportCardComponent } from './reportCard.component';

export default angular
  .module('reports.reportCard', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('../commonReportServices').default,
  ])
  .component('reportCard', new ReportCardComponent())
  .name;
