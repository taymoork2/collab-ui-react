import { CustWebexReportsComponent } from './webexReports.component';

export default angular
  .module('reports.webexReports', [])
  .component('custWebexReports', new CustWebexReportsComponent())
  .name;
