(function () {
  'use strict';

  angular.module('Core')
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($http, Config) {
    var storage = [];

    return {

      getFeaturesForUser: function (uid, callback) {
        var server = Config.getFeatureToggleUrl();
        var featureToggleURL = server + '/locus/api/v1/features/users/' + uid;

        if (this.needsToQuery(uid)) {
          callback(this.needsToQuery(uid).data, 0);
          return;
        }

        $http.get(featureToggleURL, null)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            storage.push({
              uid: uid,
              data: data
            });
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.status = status;
            callback(data, status);
          });
      },

      needsToQuery: function (uid) {
        return _.find(storage, function (el) {
          return el.uid === uid;
        });
      },
    };
  }
})();
