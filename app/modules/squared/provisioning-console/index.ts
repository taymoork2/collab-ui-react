
require('./provisioning.scss');

import { ProvisioningService } from './provisioning.service';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningDetailsController } from './overview/provisioning-details.controller';
import notifications from 'modules/core/notifications';
export *  from './provisioning.interfaces';


export default angular
 .module('squared.provisioning-console', [
   require('modules/core/config/urlConfig'),
   require('angular-translate'),
   require('angular-ui-router'),
   require('angular-sanitize'),
   notifications,
 ])
 .service('ProvisioningService', ProvisioningService)
 .controller('ProvisioningController', ProvisioningController)
 .controller('ProvisioningDetailsController', ProvisioningDetailsController)
  .name;
