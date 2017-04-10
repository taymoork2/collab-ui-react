(function () {
  'use strict';

  module.exports = angular.module('uc.device', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
  ])
  .name;
})();
