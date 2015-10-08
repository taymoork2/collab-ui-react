(function () {
  'use strict';

  angular.module('uc.hurondetails')
    .factory('ListFeaturesService', ListFeaturesService);

  /* @ngInject */
  function ListFeaturesService(Authinfo, FeatureHuntGroupServiceV2, $q) {
    var service = {
      listFeatures: listFeatures
    };

    var featureList = [];

    return service;

    function listFeatures() {
      //////////////////////////////////////////////////////////
      //   return FeatureHuntGroupServiceV2.query({           //
      //     customerId: Authinfo.getOrgId(),                 //
      //   }).$promise                                        //
      //////////////////////////////////////////////////////////

      // Temporary implementation to mock backend. Will be replaced with above code once API is ready.
      var asyncResponse = $q.defer();
      asyncResponse.resolve(featureList);
      return asyncResponse.promise;
    }
  }
})();
