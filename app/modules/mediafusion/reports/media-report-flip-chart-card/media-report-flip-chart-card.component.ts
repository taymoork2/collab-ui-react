export class MediaReportFlipChartCard implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/media-report-flip-chart-card/media-report-flip-chart-card.html');
  public bindings = < { [binding: string]: string } > {
    parentcntrl: '=',
    headername: '=',
    value: '<',
    headercolor: '<',
    tooltipOptions: '<',
    footerOptions: '<',
    chartOptions: '<',
    cardClass: '=',
    cardDesc: '=',
    dropdownPresent: '=',
  };
}
angular.module('Mediafusion').component('ucMediaReportFlipChartCard', new MediaReportFlipChartCard());
