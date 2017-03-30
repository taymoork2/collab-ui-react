import { ReportCardComponent } from './reportCard.component';

export default angular
  .module('reports.reportCard', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
    require('../commonReportServices').default,
  ])
  .component('reportCard', new ReportCardComponent())
  .name;
