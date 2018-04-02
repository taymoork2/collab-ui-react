export class ClusterCascadeBandwith implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/resources-reports/cluster-cascade-bandwidth/cluster-cascade-bandwidth.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucClusterCascadeBandwith', new ClusterCascadeBandwith());
