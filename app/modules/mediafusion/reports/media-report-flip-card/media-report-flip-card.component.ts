export class MediaReportFlipCard implements ng.IComponentOptions {
  public templateUrl = 'modules/mediafusion/reports/media-report-flip-card/media-report-flip-card.html';
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
    tooltipValue: '=',
  };
}
angular.module('Mediafusion').component('ucMediaReportFlipCard', new MediaReportFlipCard());
