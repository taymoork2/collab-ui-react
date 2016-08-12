(function () {
  'use strict';
  angular.module('Incidents')
    .factory('IncidentsService', IncidentsService);
  function IncidentsService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/incidents');
  }

})();

