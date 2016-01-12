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
      return $http.get(ConfigService.getUSSUrl() + '/organizations/' + orgId + '/services/' + service + '/upgrade_schedule')
        .then(function (response) {
          return response.data;
        }, function (error) {
          // TO BE REMOVED
          // For now it fails because this API doesn't exist…

          // If it was for one of this organisation, act like it worked!
          // It allows us to test things for now
          if (['fe5acf7a-6246-484f-8f43-3e8c910fc50d', '7312a0fc-cb4c-4cd9-af42-35ab849de4bf', 'd0d31660-1984-4557-946c-230b9b202f68'].indexOf(orgId) >= 0) {
            return {
              scheduleDay: '4',
              scheduleTime: '03:00',
              scheduleTimeZone: 'Europe/Oslo',
              isAdminAcknowledged: false
            };
          } else {
            throw error;
          }
        });
    }

    function patch(orgId, service, params) {
      return $http.patch(ConfigService.getUSSUrl() + '/organizations/' + orgId + '/services/' + service + '/upgrade_schedule', params)
        .then(function (response) {
          return response.data;
        }, function (error) {
          // TO BE REMOVED
          // For now it fails because this API doesn't exist…

          // If it was for one of this organisation, act like it worked!
          // It allows us to test things for now
          if (['fe5acf7a-6246-484f-8f43-3e8c910fc50d', '7312a0fc-cb4c-4cd9-af42-35ab849de4bf', 'd0d31660-1984-4557-946c-230b9b202f68'].indexOf(orgId) >= 0) {
            params.isAdminAcknowledged = true;
            return params;
          } else {
            throw error;
          }
        });
    }
  }
})();
