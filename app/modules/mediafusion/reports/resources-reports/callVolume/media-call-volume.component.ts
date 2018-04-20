export class MediaCallVolume implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/resources-reports/callVolume/media-call-volume.html');
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucMediaCallVolume', new MediaCallVolume());
