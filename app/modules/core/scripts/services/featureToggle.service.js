(function () {
  'use strict';

  angular.module('Core')
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($http, $q, Config, Authinfo) {

    var service = {
      getFeaturesForUser: getFeaturesForUser,
      supportsPstnSetup: supportsPstnSetup
    };

    return service;

    function getFeaturesForUser(uid, feature) {
      if (!uid || !feature) {
        return $q(function (resolve, reject) {
          reject((!uid ? 'uid' : 'feature') + ' is undefined');
        });
      }

      var server = Config.getFeatureToggleUrl();
      var featureToggleURL = server + '/locus/api/v1/features/users/' + uid;

      return $http.get(featureToggleURL, {
        cache: true
      }).then(function (data, status) {
        var contained = false;
        _.each(data.data.developer, function (element) {
          if (element.key === feature && element.val === 'true') {
            contained = true;
          }
        });
        return contained;
      });
    }

    //TODO temporary
    function supportsPstnSetup() {
      return Authinfo.getOrgId() === '666a7b2f-f82e-4582-9672-7f22829e728d';
    }
  }
})();
