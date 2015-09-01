(function () {
  'use strict';

  angular.module('Core')
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($http, Config, Authinfo) {
    var storage = [];

    var service = {
      getFeaturesForUser: getFeaturesForUser,
      needsToQuery: needsToQuery,
      supportsPstnSetup: supportsPstnSetup
    };
    return service;

    function getFeaturesForUser(uid, callback) {
      var server = Config.getFeatureToggleUrl();
      var featureToggleURL = server + '/locus/api/v1/features/users/' + uid;

      if (needsToQuery(uid)) {
        callback(needsToQuery(uid).data, 0);
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
    }

    function needsToQuery(uid) {
      return _.find(storage, function (el) {
        return el.uid === uid;
      });
    }

    //TODO temporary
    function supportsPstnSetup() {
      return Authinfo.getOrgId() === '666a7b2f-f82e-4582-9672-7f22829e728d';
    }
  }
})();
