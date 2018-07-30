import notifications from 'modules/core/notifications';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { WebexReportsUtilService } from './webex-reports-util.service';
import { CustomerSearchService } from './customer-search.service';
import { DgcPartnerTabComponent } from './dgc-partner-tab.component';
import { DgcPartnerTimeLineComponent } from './dgc-partner-time-line.component';
import { DgcPartnerTimeZoneComponent } from './dgc-partner-time-zone.component';
import { DgcPartnerWebexReportsSearchComponent } from './dgc-partner-webex-reports-search.component';
import { DgcPartnerMeetingDetailsComponent } from './dgc-partner-meeting-details.component';
import { DgcPartnerTabParticipantsComponent } from './dgc-partner-tab-participants.component';
import { PartnerSearchService } from './partner-search.service';
import { TrackUsageService } from './track-usage.service';

export default angular
  .module('partReports.webex.diagnostic', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/analytics'),
    require('modules/core/config/urlConfig'),
    notifications,
  ])
  .service('WebexReportsUtilService', WebexReportsUtilService)
  .service('CustomerSearchService', CustomerSearchService)
  .service('PartnerSearchService', PartnerSearchService)
  .service('ProPackService', ProPackService)
  .service('TrackUsageService', TrackUsageService)
  .component('dgcPartnerTab', new DgcPartnerTabComponent())
  .component('dgcPartnerTimeLine', new DgcPartnerTimeLineComponent())
  .component('dgcPartnerTimeZone', new DgcPartnerTimeZoneComponent())
  .component('dgcPartnerWebexReportsSearch', new DgcPartnerWebexReportsSearchComponent())
  .component('dgcPartnerTabMeetingDetail', new DgcPartnerMeetingDetailsComponent())
  .component('dgcPartnerTabParticipants', new DgcPartnerTabParticipantsComponent())
  .name;
