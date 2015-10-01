(function () {
  'use strict';

  angular.module('uc.hurondetails')
    .factory('ListFeaturesService', ListFeaturesService);

  /* @ngInject */
  function ListFeaturesService($q) {
    var service = {
      listFeatures: listFeatures
    };

    var featureList = [];

    return service;

    function listFeatures() {
      //TODO: Temporary implementation to mock HTTP JSON response.
      var asyncResponse = $q.defer();
      asyncResponse.resolve(featureList);
      return asyncResponse.promise;
    }
  }
})();
