(function () {
  'use strict';

  module.exports = angular
    .module('core.healthservice', [
      require('modules/core/config/urlConfig'),
    ])
    .service('HealthService', HealthService)
    .name;

   /* @ngInject */
  function HealthService($http, $q, UrlConfig) {

    var healthUrl = UrlConfig.getAdminServiceUrl() + 'ping';

    var service = {
      getHealthStatus: getHealthStatus,
    };

    return service;

    function getHealthStatus() {

      return $http.get(healthUrl)
        .then(function (response) {
          return response.data.serviceState;
        })
      .catch(function (error) {
        return $q.reject(error);
      });
    }
  }

})();
