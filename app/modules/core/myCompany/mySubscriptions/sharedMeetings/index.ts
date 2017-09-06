import notificationModule from 'modules/core/notifications/index';
import { SharedMeetingComponent } from './sharedMeetingsReport.component';
import { SharedMeetingsReportService } from './sharedMeetingsReport.service';

export default angular
  .module('myCompany.subscriptions.sharedMeetings', [
    notificationModule,
    require('angular-translate'),
    require('modules/core/config/urlConfig'),
    require('collab-ui-ng').default,
    require('modules/core/partnerReports/commonReportServices').default,
    require('modules/core/config/chartColors').default,
  ])
  .component('sharedMeetingReport', new SharedMeetingComponent())
  .service('SharedMeetingsReportService', SharedMeetingsReportService)
  .name;
