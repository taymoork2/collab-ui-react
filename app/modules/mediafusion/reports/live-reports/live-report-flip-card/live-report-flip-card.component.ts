export class LiveReportFlipCard implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/live-reports/live-report-flip-card/live-report-flip-card.html');
  public bindings = < { [binding: string]: string } > {
    parentcntrl: '=',
    headername: '=',
    value: '<',
    tooltipOptions: '<',
    footerOptions: '<',
    chartOptions: '<',
    cardClass: '=',
    cardDesc: '=',
    tooltipValue: '=',
    dropdownPresent: '=',
  };
}
angular.module('Mediafusion').component('mfLiveReportFlipCard', new LiveReportFlipCard());
