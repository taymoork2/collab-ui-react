const ProvisioningService = require('./provisioning.service');
const ProvisioningController = require('./provisioning.controller');
const ProvisioningDetailsController = require('./overview/provisioning-details.controller');


export default angular
 .module('squared.provisioning-console', [
   require('modules/core/config/urlConfig'),
   require('angular-translate'),
   require('angular-ui-router'),
   require('angular-sanitize'),
 ])
 .service('ProvisioningService', ProvisioningService)
 .controller('ProvisioningController', ProvisioningController)
 .controller('ProvisioningDetailsController', ProvisioningDetailsController)
  .name;
