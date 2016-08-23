(function () {
  'use strict';
  angular.module('Status.incidents')
    .factory('ComponentService', ComponentService);
  function ComponentService($resource) {
    return $resource('https://dataservicesbts.webex.com/status/services/:siteId/components');
  }

})();

