export class LiveMediaReportCard implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/live-reports/live-media-report-card/live-media-report-card.html');
  public bindings = < { [binding: string]: string } > {
    parentcntrl: '=',
    headername: '=',
    value: '<',
    tooltipOptions: '<',
    footerOptions: '<',
    chartOptions: '<',
    cardClass: '=',
    cardDesc: '=',
    isorg: '=',
    tooltipValue: '=',
    dropdownPresent: '=',
  };
}
angular.module('Mediafusion').component('ucLiveMediaReportCard', new LiveMediaReportCard());
