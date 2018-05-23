import { SearchService } from './searchService';
import { DgcTabComponent } from './dgcTab.component';
import { DgcTimeLineComponent } from './timeLine.component';
import { DgcTimeZoneComponent } from './timeZone.component';
import notifications from 'modules/core/notifications/index';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { ParticipantsComponent } from './tabParticipants.component';
import { MeetingdetailsComponent } from './tabMeetingdetails.component';
import { DgcWebexReportsSearchComponent } from './webexReportsSearch.component';

export default angular
  .module('reports.webex.search', [
    notifications,
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/analytics'),
    require('modules/core/config/urlConfig'),
  ])
  .service('SearchService', SearchService)
  .service('ProPackService', ProPackService)
  .component('dgcTab', new DgcTabComponent())
  .component('dgcTimeLine', new DgcTimeLineComponent())
  .component('dgcTimeZone', new DgcTimeZoneComponent())
  .component('dgcTabParticipants', new ParticipantsComponent())
  .component('dgcTabMeetingdetail', new MeetingdetailsComponent())
  .component('dgcWebexReportsSearch', new DgcWebexReportsSearchComponent())
  .name;
