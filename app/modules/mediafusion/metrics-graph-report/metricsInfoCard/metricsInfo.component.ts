export class MetricsInfoCard implements ng.IComponentOptions {
  public template = require('modules/mediafusion/metrics-graph-report/metricsInfoCard/metricsInfoCard.tpl.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucMetricsInfoCard', new MetricsInfoCard());
