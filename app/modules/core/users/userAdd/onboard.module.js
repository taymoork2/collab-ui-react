var OnboardService = require('./onboard.service');
var crServicesPanelsModuleName = require('./cr-services-panels').default;
var sharedModuleName = require('./shared').default;

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
      sharedModuleName,
    ])
    .service('OnboardService', OnboardService)
    .name;
})();
