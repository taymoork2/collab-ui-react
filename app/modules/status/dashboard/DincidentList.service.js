/**
 * Created by pso on 16-8-30.
 */
(function () {
  'use strict';
  angular.module('Status')
    .factory('DincidentListService', DincidentListService);
  function DincidentListService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/services/:siteId/incidents/:incidentId');
  }

})();
