import { ReportSliderComponent } from './reportSlider.component';

export default angular
  .module('reports.reportSlider', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('../commonReportServices').default,
  ])
  .component('reportSlider', new ReportSliderComponent())
  .name;
