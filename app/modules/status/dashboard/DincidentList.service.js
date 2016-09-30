/**
 * Created by pso on 16-8-30.
 */
(function () {
  'use strict';
  angular.module('Status')
    .factory('DincidentListService', DincidentListService);
  function DincidentListService($resource, UrlConfig) {
    var url = UrlConfig.getStatusUrl() + '/services/:siteId/incidents/:incidentId';
    return $resource(url);
  }

})();
