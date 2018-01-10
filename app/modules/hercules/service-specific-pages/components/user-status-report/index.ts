import { UserStatusReportComponent } from './user-status-report.component';
import * as ExportUserStatusesController from 'modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.controller.js';
import * as UserDetails from 'modules/hercules/service-specific-pages/components/user-status-report/user-details.js';

import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import ussServiceModuleName from 'modules/hercules/services/uss.service';
import resourceGroupServiceModuleName from 'modules/hercules/services/resource-group.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';

export default angular
  .module('hercules.service-specific-pages.components.user-status-report', [
    require('angular-translate'),
    urlConfigModuleName,
    ussServiceModuleName,
    resourceGroupServiceModuleName,
    hybridServicesClusterServiceModuleName,
  ])
  .component('userStatusReportButton', new UserStatusReportComponent())
  .controller('ExportUserStatusesController', ExportUserStatusesController)
  .service('UserDetails', UserDetails)
  .name;
