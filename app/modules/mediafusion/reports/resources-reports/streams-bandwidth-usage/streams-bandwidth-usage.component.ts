export class StreamsBandwidthUsage implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/resources-reports/streams-bandwidth-usage/streams-bandwidth-usage.html');
  public bindings = {
    parentcntrl: '=',
    type: '=',
  };
}
angular.module('Mediafusion').component('ucStreamsBandwidthUsage', new StreamsBandwidthUsage());
