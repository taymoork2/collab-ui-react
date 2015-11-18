(function () {
  'use strict';

  angular.module('Core')
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($http, $q, Config, Authinfo, Orgservice) {
    var features = {
      pstnSetup: 'pstnSetup',
      csvUpload: 'csvUpload',
      dirSync: 'dirSync',
      atlasStormBranding: 'atlasStormBranding'
    };
    var service = {
      getUrl: getUrl,
      getFeatureForUser: getFeatureForUser,
      getFeaturesForUser: getFeaturesForUser,
      getFeaturesForOrg: getFeaturesForOrg,
      supports: supports,
      supportsPstnSetup: supportsPstnSetup,
      supportsCsvUpload: supportsCsvUpload,
      supportsDirSync: supportsDirSync,
      features: features
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
      return $q(function (resolve, reject) {
        if (!feature) {
          reject('feature is undefined');
        } else {
          resolve(getFeaturesForUser(uid).then(function (response) {
            var contained = false;
            _.each(response.data.developer, function (element) {
              if (element.key === feature && element.val === 'true') {
                contained = true;
              }
            });
            return contained;
          }));
        }
      });
    }

    function getFeaturesForOrg(oid) {
      return $q(function (resolve, reject) {
        if (!oid) {
          reject('orgId is undefined');
        } else {
          var url = getUrl(false, oid);
          resolve($http.get(url, {
            cache: true
          }));
        }
      });
    }

    function supports(feature) {
      return $q(function (resolve, reject) {
        //TODO temporary hardcoded checks for huron
        if (feature === features.pstnSetup) {
          return resolve(Authinfo.getOrgId() === '666a7b2f-f82e-4582-9672-7f22829e728d');
        } else if (feature === features.csvUpload) {
          return resolve(true);
        } else if (feature === features.dirSync) {
          supportsDirSync().then(function (enabled) {
            return resolve(enabled && Authinfo.getOrgId() === '4e2befa3-9d82-4fdf-ad31-bb862133f078');
          });
        } else if (feature === features.atlasStormBranding) {
          return resolve(true);
        } else {
          return resolve(false);
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

    function supportsDirSync() {
      var deferred = $q.defer();
      Orgservice.getOrgCacheOption(function (data, status) {
        if (data.success) {
          deferred.resolve(data.dirsyncEnabled);
        } else {
          deferred.reject(status);
        }
      }, null, {
        cache: true
      });
      return deferred.promise;
    }
  }
})();
