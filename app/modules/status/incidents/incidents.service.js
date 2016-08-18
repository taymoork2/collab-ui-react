(function () {
  'use strict';
  angular.module('Status.incidents')
    .factory('IncidentsService', IncidentsService);
  function IncidentsService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/incidents/:incidentId');
  }

})();

