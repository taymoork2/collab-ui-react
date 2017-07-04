import featureToggleModule from 'modules/core/featureToggle';
import proPackModule from 'modules/core/proPack';
import notificationModule from 'modules/core/notifications';

require('./partner-management.scss');

const PartnerManagementController = require('./partner-management.controller');
const PartnerManagementService = require('./partner-management.service');
const validateMatchDirective = require('./validate-match.directive');
const validateUnusedDirective = require('./validate-unused.directive');

export default angular
  .module('squared.partner-management', [
    featureToggleModule,
    proPackModule,
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
