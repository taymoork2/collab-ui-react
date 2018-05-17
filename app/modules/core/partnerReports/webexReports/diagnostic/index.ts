import notifications from 'modules/core/notifications';
import { DgcPartnerTabComponent } from './dgc-partner-tab.component';
import { DgcPartnerTimeLineComponent } from './dgc-partner-time-line.component';
import { DgcPartnerTimeZoneComponent } from './dgc-partner-time-zone.component';
import { DgcPartnerWebexReportsSearchComponent } from './dgc-partner-webex-reports-search.component';
import { DgcPartnerMeetingDetailsComponent } from './dgc-partner-meeting-details.component';
import { DgcPartnerTabParticipantsComponent } from './dgc-partner-tab-participants.component';
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
  .component('dgcPartnerTimeLine', new DgcPartnerTimeLineComponent())
  .component('dgcPartnerTimeZone', new DgcPartnerTimeZoneComponent())
  .component('dgcPartnerWebexReportsSearch', new DgcPartnerWebexReportsSearchComponent())
  .component('dgcPartnerTabMeetingDetail', new DgcPartnerMeetingDetailsComponent())
  .component('dgcPartnerTabParticipants', new DgcPartnerTabParticipantsComponent())
  .name;
