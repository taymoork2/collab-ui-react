import featureToggleModule from 'modules/core/featureToggle';
import itProPackModule from 'modules/core/itProPack';
import notificationModule from 'modules/core/notifications';

require('./partner-management.scss');

let PartnerManagementController = require('./partner-management.controller');
let PartnerManagementService = require('./partner-management.service');
let validateMatchDirective = require('./validate-match.directive');
let validateUnusedDirective = require('./validate-unused.directive');

export default angular
  .module('squared.partner-management', [
    featureToggleModule,
    itProPackModule,
    notificationModule,
    require('modules/core/config/urlConfig'),
    require('angular-translate'),
    require('angular-ui-router'),
    require('angular-sanitize'),
  ])
  .controller('PartnerManagementController', PartnerManagementController)
  .service('PartnerManagementService', PartnerManagementService)
  .directive('validateMatch', validateMatchDirective)
  .directive('validateUnused', validateUnusedDirective)
  .name;
