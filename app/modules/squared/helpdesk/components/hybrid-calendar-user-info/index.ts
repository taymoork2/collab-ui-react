import { HelpDeskHybridCalendarUserInfoComponent } from './hybrid-calendar-user-info.component';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service.js';
import './_hybrid-calendar-user-info.scss';

export default angular
  .module('squared.helpdesk.components.hybrid-calendar-user-info', [
    require('angular-translate'),
    hybridServicesClusterServiceModuleName,
    userServiceModuleName,
  ])
  .component('helpDeskHybridCalendarUserInfo', new HelpDeskHybridCalendarUserInfoComponent())
  .name;
