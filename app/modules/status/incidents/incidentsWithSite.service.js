(function () {
  'use strict';

  angular.module('Status.incidents')
    .factory('IncidentsWithSiteService', IncidentsWithSiteService);
  function IncidentsWithSiteService($resource, UrlConfig) {
    var url = UrlConfig.getStatusUrl() + '/services/:siteId/incidents/:incidentId';
    return $resource(url);
  }

})();

