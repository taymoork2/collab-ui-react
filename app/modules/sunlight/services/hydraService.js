/**
 * Created by sundravi on 18/08/15.
 */

(function () {
  'use strict';

  /* @ngInject */
  function hydraService($http, UrlConfig) {
    var hydraApplicationUrl = UrlConfig.getHydraServiceUrl() + '/applications';
    var service = {
      getHydraApplicationDetails: getHydraApplicationDetails,
    };

    return service;

    function getHydraApplicationDetails(hydraAppId) {
      return $http.get(hydraApplicationUrl + '/' + hydraAppId);
    }
  }

  module.exports = hydraService;
})();
