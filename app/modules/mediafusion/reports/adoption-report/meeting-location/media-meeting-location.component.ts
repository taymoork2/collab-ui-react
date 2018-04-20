export class MediaMeetingLocation implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/adoption-report/meeting-location/media-meeting-location.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucMediaMeetingLocation', new MediaMeetingLocation());
