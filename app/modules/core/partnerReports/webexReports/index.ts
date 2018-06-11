import './webex-reports.scss';
import './webex-reports-tabs.scss';
import { WebexReportsTabsComponent } from './webexReportsTabs.component';
import { WebexReportsComponent } from './webexReports.component';

export default angular
  .module('reports.webexReports', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/featureToggle').default,
    require('modules/core/notifications').default,
  ])
  .component('webexReportsTabs', new WebexReportsTabsComponent())
  .component('webexReports', new WebexReportsComponent())
  .name;
