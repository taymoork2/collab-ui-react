export class UtilizationMetrics implements ng.IComponentOptions {
  public template = require('modules/mediafusion/metrics-graph-report/utilization/utilization.tpl.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucUtilizationMetrics', new UtilizationMetrics());
