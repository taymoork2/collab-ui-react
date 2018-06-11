import { ReportCardComponent } from './reportCard.component';

export default angular
  .module('reports.reportCard', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('../commonReportServices').default,
  ])
  .component('reportCard', new ReportCardComponent())
  .name;
