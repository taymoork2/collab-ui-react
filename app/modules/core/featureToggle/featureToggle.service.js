(function () {
  'use strict';

  angular.module('Core')
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($resource, $q, Config, Authinfo, Orgservice, Userservice) {
    var features = {
      pstnSetup: 'pstnSetup',
      csvUpload: 'csvUpload',
      dirSync: 'dirSync',
      atlasCloudberryTrials: 'atlas-cloudberry-trials',
      atlasStormBranding: 'atlas-2015-storm-launch',
      atlasSipUriDomain: 'atlas-sip-uri-domain',
    };

    var service = {
      getUrl: getUrl,
      getFeatureForUser: getFeatureForUser,
      getFeaturesForUser: getFeaturesForUser,
      getFeatureForOrg: getFeatureForOrg,
      getFeaturesForOrg: getFeaturesForOrg,
      supports: supports,
      supportsPstnSetup: supportsPstnSetup,
      supportsCsvUpload: supportsCsvUpload,
      supportsDirSync: supportsDirSync,
      features: features,
    };

    var orgResource = $resource(Config.getWdmUrl() + '/features/rules/:id', {
      id: '@id'
    }, {
      get: {
        method: 'GET',
        cache: true
      }
    });

    var userResource = $resource(Config.getFeatureToggleUrl() + '/locus/api/v1/features/users/:id', {
      id: '@id'
    }, {
      get: {
        method: 'GET',
        cache: true
      }
    });

    return service;

    function getFeatureForUser(id, feature) {
      return getFeature(true, id, feature);
    }

    function getFeaturesForUser(id) {
      return getFeatures(true, id);
    }

    function getFeatureForOrg(id, feature) {
      return getFeature(false, id, feature);
    }

    function getFeaturesForOrg(id) {
      return getFeatures(false, id);
    }

    function getUrl(isUser) {
      return isUser ? userResource : orgResource;
    }

    function getFeatures(isUser, id) {
      if (angular.isUndefined(id) || !id) {
        return $q.reject('id is undefined');
      }

      return getUrl(isUser).get({
        id: id
      }).$promise.then(function (response) {
        _.forEach(response.developer, fixVal);
        _.forEach(response.entitlement, fixVal);
        _.forEach(response.user, fixVal);
        return response;
      });
    }

    function getFeature(isUser, id, feature) {
      if (angular.isUndefined(feature) || !feature) {
        return $q.reject('feature is undefined');
      }

      return getFeatures(isUser, id).then(function (features) {
        var key = _.find(features.developer, {
          key: feature
        });
        if (angular.isUndefined(key)) {
          return false;
        }
        return key.val;
      }).catch(function (err) {
        return false;
      });
    }

    function supports(feature) {
      return $q(function (resolve, reject) {
        //TODO temporary hardcoded checks for huron
        if (feature === features.pstnSetup) {
          return resolve(Authinfo.getOrgId() === '666a7b2f-f82e-4582-9672-7f22829e728d' || Authinfo.getOrgId() === 'a28c73de-8ebe-46b1-867a-a4d8bdac8c3f');
        } else if (feature === features.csvUpload) {
          resolve(true);
        } else if (feature === features.dirSync) {
          supportsDirSync().then(function (enabled) {
            resolve(enabled && Authinfo.getOrgId() === '4e2befa3-9d82-4fdf-ad31-bb862133f078');
          });
        } else if (feature === features.atlasCloudberryTrials) {
          if (Authinfo.getOrgId() === 'c054027f-c5bd-4598-8cd8-07c08163e8cd') {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          var orgId = Authinfo.getOrgId();

          Userservice.getUser('me', function (data, status) {
            var userId = data.id;
            getFeatureForUser(userId, feature).then(function (userResult) {
              if (!userResult) {
                getFeatureForOrg(orgId, feature).then(function (orgResult) {
                  resolve(orgResult);
                });
              } else {
                resolve(userResult);
              }
            });
          });
        }
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

    /**
     * Feature toggle rules will set feature toggles for organizations
     * @param  {uuid} orgId
     * @param  {string} key   one of the FeatureToggleService.features
     * @param  {any} val      false to turn off, otherwise any value
     * @return {object}       this should not be used outside of this service
     */
    function generateFeatureToggleRule(orgId, key, val) {
      return {
        val: val,
        key: key,
        orgId: orgId,
        group: 'ORG',
      };
    }

    /**
     * convenience fn to change val:['true'|'false'] to val:[true|false]
     * @param  {object} feature feature from service
     * @return {object}         feature with swap
     */
    function fixVal(feature) {
      var val = feature.val;
      if (val === 'true') {
        feature.val = true;
      } else if (val === 'false') {
        feature.val = false;
      }
    }
  }
})();
