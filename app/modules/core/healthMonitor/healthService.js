(function () {
  'use strict';

  module.exports = angular
    .module('core.healthservice', [
      require('modules/core/config/urlConfig'),
    ])
    .service('HealthService', HealthService)
    .name;

  /* @ngInject */
  function HealthService($http, UrlConfig) {
    var service = {
      getHealthStatus: getHealthStatus,
    };

    return service;

    function getHealthStatus() {
      // TODO: move UrlConfig.getAdminServiceUrl() back to initialized variable
      // after environment initialization is moved to config provider
      return $http.get(UrlConfig.getAdminServiceUrl() + 'ping')
        .then(function (response) {
          return response.data.serviceState;
        });
    }
  }
})();
