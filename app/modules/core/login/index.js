require('./_login.scss');

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
    require('modules/core/storage').default,
    require('modules/core/scripts/services/utils'),
  ]).directive('login', require('./login.directive'))
    .name;

}());
