(function () {
  'use strict';

  module.exports = angular.module('core.trackingId', [
    require('modules/core/scripts/services/utils')
  ]).name;

  require('./trackingId.service');
  require('./trackingId.interceptor');
}());
