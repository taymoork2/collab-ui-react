export class AvailabilityMetrics implements ng.IComponentOptions {
  public template = require('modules/mediafusion/metrics-graph-report/availability/availability.tpl.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucAvailabilityMetrics', new AvailabilityMetrics());
