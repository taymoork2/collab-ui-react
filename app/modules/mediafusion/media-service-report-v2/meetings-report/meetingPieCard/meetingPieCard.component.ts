export class MeetingPieChart implements ng.IComponentOptions {
  public templateUrl = 'modules/mediafusion/media-service-report-v2/meetings-report/meetingPieCard/meetingPieCard.tpl.html';
  public bindings = {
    parentcntrl: '=',
    options: '<',
  };
}

angular.module('Mediafusion').component('ucMeetingPieChart', new MeetingPieChart());
