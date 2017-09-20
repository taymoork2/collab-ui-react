export class MediaAvailability implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/resources-reports/availability/media-availability.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucMediaAvailability', new MediaAvailability());
