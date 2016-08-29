(function () {
  'use strict';
  angular.module('Status.incidents')
    .factory('IncidentsWithoutSiteService', IncidentsWithoutSiteService);
  function IncidentsWithoutSiteService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/services/101/incidents', {}, { 'getIncidentMsg': { method: 'GET', isArray: false } });
  }

})();

