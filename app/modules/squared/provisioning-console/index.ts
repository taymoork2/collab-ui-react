//import { ProvisioningService } from './provisioning.service';


require('./_provisioning.scss');

import { ProvisioningService } from './provisioning.service';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningDetailsController } from './overview/provisioning-details.controller';


export default angular
 .module('squared.provisioning-console', [
   require('modules/core/config/urlConfig'),
   require('angular-translate'),
   require('angular-ui-router'),
   require('angular-sanitize'),
 ])
 .service('ProvisioningService', ProvisioningService)
 //.service('ProvisioningService', ProvisioningService)
 .controller('ProvisioningController', ProvisioningController)
 .controller('ProvisioningDetailsController', ProvisioningDetailsController)
  .name;
