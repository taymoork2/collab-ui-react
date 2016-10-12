(function () {
  'use strict';

  angular.module('Status.incidents')
    .factory('MessageService', MessageService);
  function MessageService($resource, UrlConfig) {
    var url = UrlConfig.getStatusUrl() + '/incidents/messages/:messageId';
    return $resource(url, {}, { 'modifyMsg': { method: 'PUT', isArray: false } });
  }
})();
