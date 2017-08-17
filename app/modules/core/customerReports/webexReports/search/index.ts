import { SearchService } from './searchService';
import { CustTimeLineComponent } from './timeLine.component';
import { CustTimeZoneComponent } from './timeZone.component';
import notifications from 'modules/core/notifications/index';
import { CustWebexReportsMoreComponent } from './webexReportsMore.component';
import { CustWebexReportsPanelComponent } from './webexReportsPanel.component';
import { CustWebexReportsSearchComponent } from './webexReportsSearch.component';

export default angular
  .module('reports.webex.search', [
    notifications,
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/analytics'),
    require('modules/core/config/urlConfig'),
  ])
  .service('SearchService', SearchService)
  .component('custTimeLine', new CustTimeLineComponent())
  .component('custTimeZone', new CustTimeZoneComponent())
  .component('custWebexReportsMore', new CustWebexReportsMoreComponent())
  .component('custWebexReportsPanel', new CustWebexReportsPanelComponent())
  .component('custWebexReportsSearch', new CustWebexReportsSearchComponent())
  .name;
