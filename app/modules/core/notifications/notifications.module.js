(function () {
  'use strict';

  module.exports = angular.module('core.notifications', [
    'toaster',
    require('modules/core/config/config'),
    require('modules/core/scripts/services/authinfo'),
  ]).name;

  require('./alert.service');
  require('./csConfirmation.directive');
  require('./notification');
}());
