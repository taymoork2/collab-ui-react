(function () {
  'use strict';

  angular.module('Core')
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($http, Config) {

    return {

      getFeaturesForUser: function (uid, callback) {
        var server = Config.getFeatureToggleUrl();
        var featureToggleURL = server + '/locus/api/v1/features/users/' + uid;

        $http.get(featureToggleURL, null)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.status = status;
            callback(data, status);
          });
      }
    };
  }
})();
