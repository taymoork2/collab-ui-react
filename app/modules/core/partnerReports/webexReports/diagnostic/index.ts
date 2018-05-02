import notifications from 'modules/core/notifications';
import { DgcPartnerTabComponent } from './dgc-partner-tab.component';
import { DgcTimeLineComponent } from './time-line.component';
import { DgcTimeZoneComponent } from './time-zone.component';
import { DgcWebexReportsSearchComponent } from './webex-reports-search.component';
import { MeetingDetailsComponent } from './tab-meeting-details.component';
import { ParticipantsComponent } from './tab-participants.component';
import { PartnerSearchService } from './partner-search.service';

export default angular
  .module('partReports.webex.diagnostic', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/analytics'),
    require('modules/core/config/urlConfig'),
    notifications,
  ])
  .service('PartnerSearchService', PartnerSearchService)
  .component('dgcPartnerTab', new DgcPartnerTabComponent())
  .component('dgcPartnerTimeLine', new DgcTimeLineComponent())
  .component('dgcPartnerTimeZone', new DgcTimeZoneComponent())
  .component('dgcPartnerWebexReportsSearch', new DgcWebexReportsSearchComponent())
  .component('dgcPartnerTabMeetingDetail', new MeetingDetailsComponent())
  .component('dgcPartnerTabParticipants', new ParticipantsComponent())
  .name;
