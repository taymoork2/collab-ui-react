import { CustWebexReportsComponent } from './webexReports.component';

export default angular
  .module('reports.webex', [
    require('modules/core/customerReports/webexReports/search').default,
  ])
  .component('custWebexReports', new CustWebexReportsComponent())
  .name;
