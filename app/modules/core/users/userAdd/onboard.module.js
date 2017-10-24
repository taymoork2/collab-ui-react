var OnboardService = require('./onboard.service');
var MessengerInteropService = require('./messenger-interop.service').default;
var crServicesPanelsModuleName = require('./cr-services-panels').default;

require('./_user-add.scss');

(function () {
  'use strict';

  // TODO (mipark2):
  // - register other components in this directory to this module
  // - mv this file -> 'index.ts'
  module.exports = angular
    .module('core.users.userAdd', [
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/config/config').default,
      crServicesPanelsModuleName,
    ])
    .service('OnboardService', OnboardService)
    .service('MessengerInteropService', MessengerInteropService)
    .name;
})();
