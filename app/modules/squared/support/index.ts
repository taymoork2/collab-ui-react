import featureToggleService from 'modules/core/featureToggle';
import { SupportMeetingComponent } from './support-meeting.component';
import 'modules/core/customerReports/webexReports/diagnostic/_search.scss';

export default angular
  .module('squared.support.meeting', [
    featureToggleService,
  ])
  .component('supportMeetingComponent', new SupportMeetingComponent())
  .name;
