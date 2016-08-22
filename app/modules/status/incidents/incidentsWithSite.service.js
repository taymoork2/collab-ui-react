(function () {
  'use strict';
  angular.module('Status.incidents')
    .factory('IncidentsWithSiteService', IncidentsWithSiteService);
  function IncidentsWithSiteService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/services/:siteId/incidents/:incidentId');
  }

})();

