export class MediaParticipantDistribution implements ng.IComponentOptions {
  public templateUrl = 'modules/mediafusion/reports/resources-reports/participantDistribution/media-participant-distribution.html';
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucMediaParticipantDistribution', new MediaParticipantDistribution());
