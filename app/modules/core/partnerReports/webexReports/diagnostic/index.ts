import { DgcPartnerTabComponent } from './dgc-partner-tab.component';
import notifications from 'modules/core/notifications';
import { PartnerSearchService } from './partner-search.service';

export default angular
  .module('partReports.webex.diagnostic', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/analytics'),
    require('modules/core/config/urlConfig'),
    notifications,
  ])
  .service('PartnerSearchService', PartnerSearchService)
  .component('dgcPartnerTab', new DgcPartnerTabComponent())
  .name;
