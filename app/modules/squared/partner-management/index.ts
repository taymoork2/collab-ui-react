require('./partner-management.scss');

let PartnerManagementController = require('./partner-management.controller');
let PartnerManagementService = require('./partner-management.service');
let validateMatchDirective = require('./validate-match.directive');
let validateUnusedDirective = require('./validate-unused.directive');

export default angular
  .module('squared.partner-management', [
    require('modules/core/config/urlConfig'),
    require('modules/core/notifications').default,
    require('angular-translate'),
    require('angular-ui-router'),
    require('angular-sanitize'),
  ])
  .controller('PartnerManagementController', PartnerManagementController)
  .service('PartnerManagementService', PartnerManagementService)
  .directive('validateMatch', validateMatchDirective)
  .directive('validateUnused', validateUnusedDirective)
  .name;
