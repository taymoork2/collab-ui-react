var OnboardService = require('./onboard.service');

require('./_user-add.scss');

(function () {
  'use strict';

  module.exports = angular
    .module('core.onboard', [
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/config/config'),
    ])
    .service('OnboardService', OnboardService)
    .name;
})();
