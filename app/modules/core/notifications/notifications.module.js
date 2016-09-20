(function () {
  'use strict';

  module.exports = angular.module('core.notifications', [
    'toaster',
    require('modules/core/config/config'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/log'),
  ]).name;

  require('./alert.service');
  require('./csConfirmation.directive');
  require('./notification');
  require('./bindUnsafeHtml.directive');
}());
