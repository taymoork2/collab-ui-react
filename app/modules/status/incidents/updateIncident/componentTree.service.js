(function () {
  'use strict';

  angular.module('Status.incidents')
    .factory('ComponentService', ComponentService);
  function ComponentService($resource, UrlConfig) {
    var url = UrlConfig.getStatusUrl() + '/services/:siteId/components';
    return $resource(url);
  }

})();

