(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('ScheduleUpgradeService', ScheduleUpgradeService);

  /* @ngInject */
  function ScheduleUpgradeService($http, UrlConfig) {
    var services = {
      get: get,
      patch: patch
    };

    return services;

    function get(orgId, service) {
      return $http.get(UrlConfig.getHerculesUrl() + '/organizations/' + orgId + '/services/' + service + '/upgrade_schedule')
        .then(extractData);
    }

    function patch(orgId, service, params) {
      return $http.patch(UrlConfig.getHerculesUrl() + '/organizations/' + orgId + '/services/' + service + '/upgrade_schedule', params)
        .then(extractData);
    }

    function extractData(response) {
      return response.data;
    }
  }
})();
