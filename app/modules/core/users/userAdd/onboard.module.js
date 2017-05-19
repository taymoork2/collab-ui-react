var OnboardService = require('./onboard.service');
var MessengerInteropService = require('./messenger-interop.service').default;

require('./_user-add.scss');

(function () {
  'use strict';

  module.exports = angular
    .module('core.onboard', [
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/config/config'),
    ])
    .service('OnboardService', OnboardService)
    .service('MessengerInteropService', MessengerInteropService)
    .name;
})();
