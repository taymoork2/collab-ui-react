export class CascadeBandwith implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/resources-reports/cascade-bandwidth/cascade-bandwidth.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucMediaCascadeBandwith', new CascadeBandwith());