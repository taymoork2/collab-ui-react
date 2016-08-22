(function () {
  'use strict';
  angular.module('Status.incidents')
         .factory('UpdateIncidentService', UpdateIncidentService);
  function UpdateIncidentService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/incidents/:incidentId/messages');
  }
})();
