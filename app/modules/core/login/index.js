(function () {
  'use strict';

  module.exports = angular.module('Login', [
      'pascalprecht.translate',
      require('modules/core/auth/auth'),
      require('modules/core/auth/token.service'),
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/scripts/services/log'),
      require('modules/core/scripts/services/logmetricsservice'),
      require('modules/core/scripts/services/pageparam'),
      require('modules/core/scripts/services/sessionstorage'),
      require('modules/core/scripts/services/storage'),
      require('modules/core/scripts/services/utils'),
    ]).directive('login', require('./login.directive'))
    .name;

}());
