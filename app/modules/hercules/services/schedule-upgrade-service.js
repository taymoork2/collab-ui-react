(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('ScheduleUpgradeService', ScheduleUpgradeService);

  /* @ngInject */
  function ScheduleUpgradeService($http, $q, ConfigService) {
    var services = {
      get: get,
      patch: patch
    };

    return services;

    function get(orgId, service) {
      return $http.get(ConfigService.getUrl() + '/organizations/' + orgId + '/services/' + service + '/upgrade_schedule')
        .then(function (response) {
          return response.data;
        });
    }

    function patch(orgId, service, params) {
      return $http.patch(ConfigService.getUrl() + '/organizations/' + orgId + '/services/' + service + '/upgrade_schedule', params)
        .then(function (response) {
          return response.data;
        });
    }
  }
})();
