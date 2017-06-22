import { SearchService } from './searchService';
import { CustWebexReportsMoreComponent } from './webexReportsMore.component';
import { CustWebexReportsPanelComponent } from './webexReportsPanel.component';
import { CustWebexReportsSearchComponent } from './webexReportsSearch.component';

export default angular
  .module('reports.webex.search', [
    require('angular-translate'),
    require('modules/core/config/urlConfig'),
  ])
  .service('SearchService', SearchService)
  .component('custWebexReportsMore', new CustWebexReportsMoreComponent())
  .component('custWebexReportsPanel', new CustWebexReportsPanelComponent())
  .component('custWebexReportsSearch', new CustWebexReportsSearchComponent())
  .name;
