/**
 * Created by pso on 16-8-30.
 */
(function () {
  'use strict';
  angular.module('Status')
    .factory('DashboardService', DashboardService);
  function DashboardService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/services/:siteId/incidents/');
  }

})();
