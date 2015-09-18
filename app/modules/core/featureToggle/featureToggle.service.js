(function () {
  'use strict';

  angular.module('Core')
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($http, $q, Config, Authinfo) {
    var features = {
      pstnSetup: 'pstnSetup',
      csvUpload: 'csvUpload'
    };
    var service = {
      getUrl: getUrl,
      getFeatureForUser: getFeatureForUser,
      getFeaturesForUser: getFeaturesForUser,
      getFeaturesForOrg: getFeaturesForOrg,
      supports: supports,
      supportsCsvUpload: supportsCsvUpload
    };

    return service;

    function getUrl(isUid, uidOrOid) {
      var url = Config.getFeatureToggleUrl();
      url += '/locus/api/v1/features/';
      url += isUid ? 'users/' : 'rules/';
      url += uidOrOid;
      return url;
    }

    function getFeaturesForUser(uid) {
      if (!uid) {
        return $q(function (resolve, reject) {
          reject('userId is undefined');
        });
      }

      var url = getUrl(true, uid);

      return $http.get(url, {
        cache: true
      });
    }

    function getFeatureForUser(uid, feature) {
      if (!feature) {
        return $q(function (resolve, reject) {
          reject('feature is undefined');
        });
      }

      return getFeaturesForUser(uid).then(function (data, status) {
        var contained = false;
        _.each(data.data.developer, function (element) {
          if (element.key === feature && element.val === 'true') {
            contained = true;
          }
        });
        return contained;
      });
    }

    function getFeaturesForOrg(oid) {
      if (!oid) {
        return $q(function (resolve, reject) {
          reject('orgId is undefined');
        });
      }

      var url = getUrl(false, oid);

      return $http.get(url, {
        cache: true};
      }

    function supports(feature) {
      return $q(function (resolve, reject) {
        //TODO temporary hardcoded checks for huron
        if (feature === features.pstnSetup) {
          return resolve(Authinfo.getOrgId() === '666a7b2f-f82e-4582-9672-7f22829e728d');
        } else if (feature === features.csvUpload) {
          return resolve(Authinfo.getOrgId() === '151d02da-33a2-45aa-9467-bdaebbaeee76');
        }
        // else {
        //TODO first check user features
        //TODO then check org features
        //TODO last check system features
        // }
      });
    }

    //TODO temporary
    function supportsPstnSetup() {
      return supports(features.pstnSetup);
    }

    function supportsCsvUpload() {
      return supports(features.csvUpload);
    }
  }
})();
