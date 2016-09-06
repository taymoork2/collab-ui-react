(function () {
  'use strict';
  angular.module('Status.incidents')
    .factory('AffectedComponentService', AffectedComponentService);
  function AffectedComponentService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/incidents/messages/:messageId');
  }
})();
