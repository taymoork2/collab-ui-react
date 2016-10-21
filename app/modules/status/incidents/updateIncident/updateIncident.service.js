(function () {
  'use strict';

  angular.module('Status.incidents')
         .factory('UpdateIncidentService', UpdateIncidentService);
  function UpdateIncidentService($resource, UrlConfig) {
    var url = UrlConfig.getStatusUrl() + '/incidents/:incidentId/messages';
    return $resource(url);
  }
})();
