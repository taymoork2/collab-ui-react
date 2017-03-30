import { ReportSliderComponent } from './reportSlider.component';

export default angular
  .module('reports.reportSlider', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
    require('../commonReportServices').default,
  ])
  .component('reportSlider', new ReportSliderComponent())
  .name;
