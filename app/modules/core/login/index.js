require('./_login.scss');

(function () {
  'use strict';

  module.exports = angular.module('Login', [
    require('angular-translate'),
    require('modules/core/auth/auth'),
    require('modules/core/focus').default,
    require('modules/core/auth/token.service'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/log'),
    require('modules/core/scripts/services/logmetricsservice'),
    require('modules/core/scripts/services/pageparam'),
    require('modules/core/storage').default,
    require('modules/core/scripts/services/utils'),
    require('modules/core/cache').default,
    require('modules/core/metrics').default,
  ]).directive('login', require('./login.directive'))
    .name;
}());
