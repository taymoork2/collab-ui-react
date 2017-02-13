export class MediaClientType implements ng.IComponentOptions {
  public templateUrl = 'modules/mediafusion/reports/adoption-report/client-type/media-client-type.html';
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucMediaClientType', new MediaClientType());
