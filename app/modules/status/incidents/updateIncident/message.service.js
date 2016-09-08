(function () {
  'use strict';
  angular.module('Status.incidents')
    .factory('MessageService', MessageService);
  function MessageService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/incidents/messages/:messageId', {}, { 'modifyMsg': { method: 'PUT', isArray: false } });
  }
})();
