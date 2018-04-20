export class LiveReportCard implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/live-reports/live-report-card/live-report-card.html');
  public bindings = < { [binding: string]: string } > {
    parentcntrl: '=',
    headername: '=',
    value: '<',
    tooltipOptions: '<',
    footerOptions: '<',
    chartOptions: '<',
    cardClass: '=',
    tooltipValue: '=',
    dropdownPresent: '=',
  };
}
angular.module('Mediafusion').component('mfLiveReportCard', new LiveReportCard());
