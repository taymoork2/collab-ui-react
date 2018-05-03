export class MediaUtilization implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/resources-reports/utilization/media-utilization.html');
  public bindings = {
    parentcntrl: '=',
    type: '<',
  };
}
angular.module('Mediafusion').component('ucMediaUtilization', new MediaUtilization());
