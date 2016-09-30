(function () {
  'use strict';
  angular.module('Status.incidents')
    .factory('IncidentsWithoutSiteService', IncidentsWithoutSiteService);
  function IncidentsWithoutSiteService($resource, UrlConfig) {
    var url = UrlConfig.getStatusUrl() + '/incidents/:incidentId';
    return $resource(url, {}, { 'getIncidentMsg': { method: 'GET', isArray: false }, 'modifyIncident': { method: 'PUT', isArray: false } });
  }
})();

