export class LiveReportFlipChartCard implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/live-reports/live-report-flip-chart-card/live-report-flip-chart-card.html');
  public bindings = < { [binding: string]: string } > {
    parentcntrl: '=',
    headername: '=',
    value: '<',
    tooltipOptions: '<',
    footerOptions: '<',
    chartOptions: '<',
    cardClass: '=',
    cardDesc: '=',
    dropdownPresent: '=',
  };
}
angular.module('Mediafusion').component('mfLiveReportFlipChartCard', new LiveReportFlipChartCard());
