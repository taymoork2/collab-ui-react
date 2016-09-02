(function () {
  'use strict';
  angular.module('Status.incidents')
    .factory('IncidentsWithoutSiteService', IncidentsWithoutSiteService);
  function IncidentsWithoutSiteService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/incidents/:incidentId', {}, { 'getIncidentMsg': { method: 'GET', isArray: false } });
  }

})();

