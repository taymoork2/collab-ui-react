export class MediaReportFlipChartCard implements ng.IComponentOptions {
  public templateUrl = 'modules/mediafusion/reports/media-report-flip-chart-card/media-report-flip-chart-card.html';
  public bindings = < { [binding: string]: string } > {
    parentcntrl: '=',
    headername: '=',
    value: '<',
    headercolor: '<',
    tooltipOptions: '<',
    footerOptions: '<',
    chartOptions: '<',
    cardClass: '=',
  };
}
angular.module('Mediafusion').component('ucMediaReportFlipChartCard', new MediaReportFlipChartCard());
