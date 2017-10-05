export class CallVolumeMetrics implements ng.IComponentOptions {
  public template = require('modules/mediafusion/metrics-graph-report/callVolume/callVolume.tpl.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucCallVolumeMetrics', new CallVolumeMetrics());
