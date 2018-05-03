import 'modules/core/customerReports/webexReports/diagnostic/_search.scss';

class SupportMeetingController implements ng.IComponentController {

}

export class SupportMeetingComponent implements ng.IComponentOptions {
  public controller = SupportMeetingController;
  public template = require('./support-meeting.html');
}

export default angular
  .module('squared.support.meeting', [])
  .component('supportMeetingComponent', new SupportMeetingComponent())
  .name;
