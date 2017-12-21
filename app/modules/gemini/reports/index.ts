import { CustChartComponent } from './chart.component';
import { ReportsChartService } from './reportsChartService';
import { CcaReportsComponent } from './ccaReports.component';
import { CcaReportsTabsComponent } from './ccaReportsTabs.component';
import { SearchService } from 'modules/core/customerReports/webexReports/diagnostic/searchService';

export default angular
  .module('gemini.services.reports', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/analytics'),
    require('modules/core/config/urlConfig'),
  ])
  .service('SearchService', SearchService)
  .service('ReportsChartService', ReportsChartService)
  .component('ccaChart', new CustChartComponent())
  .component('ccaReports', new CcaReportsComponent())
  .component('ccaReportsTabs', new CcaReportsTabsComponent())
  .name;
