(function () {
  'use strict';

  angular.module('Core')
    .factory('HuronCustomerFeatureToggleService', HuronCustomerFeatureToggleService)
    .factory('HuronUserFeatureToggleService', HuronUserFeatureToggleService)
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($resource, $q, Config, Authinfo, Orgservice, Userservice, HuronCustomerFeatureToggleService, HuronUserFeatureToggleService) {
    var features = {
      pstnSetup: 'pstnSetup',
      csvUpload: 'csvUpload',
      dirSync: 'dirSync',
      atlasCloudberryTrials: 'atlas-cloudberry-trials',
      atlasStormBranding: 'atlas-2015-storm-launch',
      atlasSipUriDomain: 'atlas-sip-uri-domain',
      atlasWebexTrials: 'atlas-webex-trials',
      atlasDeviceTrials: 'atlas-device-trials',
      huronHuntGroup: 'huronHuntGroup',
      huronAutoAttendant: 'huronAutoAttendant',
      huronClassOfService: 'COS',
      csdmHuron: 'csdm-huron'
    };

    var service = {
      getUrl: getUrl,
      getFeatureForUser: getFeatureForUser,
      getFeaturesForUser: getFeaturesForUser,
      getFeatureForOrg: getFeatureForOrg,
      getFeaturesForOrg: getFeaturesForOrg,
      setFeatureToggle: setFeatureToggle,
      supports: supports,
      supportsPstnSetup: supportsPstnSetup,
      supportsCsvUpload: supportsCsvUpload,
      supportsDirSync: supportsDirSync,
      features: features,
    };

    var toggles = {};

    var orgResource = $resource(Config.getWdmUrl() + '/features/rules/:id', {
      id: '@id'
    }, {
      get: {
        method: 'GET',
        cache: true
      },
      refresh: {
        method: 'GET',
        cache: false
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

    function getFeaturesForOrg(id, clearCache) {
      return getFeatures(false, id, clearCache);
    }

    function getUrl(isUser) {
      return isUser ? userResource : orgResource;
    }

    function getFeatures(isUser, id, clearCache) {
      if (!id) {
        return $q.reject('id is undefined');
      }
      clearCache = clearCache || false;
      var info = {
        id: id
      };
      var url = getUrl(isUser);

      var response;
      if (!isUser && clearCache) {
        response = url.refresh(info);
      } else {
        response = url.get(info);
      }

      return response.$promise.then(function (response) {
        if (isUser) {
          _.forEach(response.developer, fixVal);
          _.forEach(response.entitlement, fixVal);
          _.forEach(response.user, fixVal);
        } else {
          _.forEach(response.featureToggles, fixVal);
        }
        return response;
      });
    }

    function getHuronToggle(isUser, id, feature) {
      if (Authinfo.isSquaredUC()) {
        if (isUser) {
          return HuronUserFeatureToggleService.get({
            userId: id,
            featureName: feature
          }).$promise.then(function (data) {
            toggles[feature] = data.val;
            return data.val;
          }).catch(function (err) {
            return false;
          });
        } else {
          return HuronCustomerFeatureToggleService.get({
            customerId: id,
            featureName: feature
          }).$promise.then(function (data) {
            toggles[feature] = data.val;
            return data.val;
          }).catch(function (err) {
            return false;
          });
        }
      } else {
        return $q.when(false);
      }
    }

    function getFeature(isUser, id, feature) {
      if (!feature) {
        return $q.reject('feature is undefined');
      }

      var atlasToggle = getFeatures(isUser, id).then(function (features) {
        // find the toggle, then get the val, default to false
        return _.get(_.find(features.developer, {
          key: feature
        }), 'val', false);
      }).catch(function (err) {
        return false;
      });

      return atlasToggle.then(function (toggle) {
        if (!toggle) {
          return getHuronToggle(isUser, id, feature);
        } else {
          return toggle;
        }
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
            resolve(enabled);
          });
        } else if (feature === features.atlasCloudberryTrials) {
          resolve(true);
        } else if (feature === features.huronClassOfService && Authinfo.getOrgId() === 'bdeda0ba-b761-4f52-831a-2c20c41714f1') {
          resolve(true);
        } else if (angular.isDefined(toggles[feature])) {
          resolve(toggles[feature]);
        } else {
          Userservice.getUser('me', function (data, status) {
            getFeatureForUser(data.id, feature).then(function (result) {
              if (!result) {
                resolve(getHuronToggle(false, Authinfo.getOrgId(), feature));
              } else {
                resolve(result);
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

    function setFeatureToggle(isUser, id, key, val) {
      if (isUser) {
        return $q.reject('User level toggles are not changeable in the web app');
      }

      var toggle = isUser ? undefined : generateFeatureToggleRule(id, key, val);
      var usingId = isUser ? undefined : '';

      return getUrl(isUser).save({
        id: usingId
      }, toggle).$promise;
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

  /* @ngInject */
  function HuronUserFeatureToggleService($resource, HuronConfig) {
    return $resource(HuronConfig.getMinervaUrl() + '/features/users/:userId/developer/:featureName', {
      userId: '@userId',
      featureName: '@featureName'
    }, {
      get: {
        method: 'GET',
        cache: true
      }
    });
  }

  /* @ngInject */
  function HuronCustomerFeatureToggleService($resource, HuronConfig) {
    return $resource(HuronConfig.getMinervaUrl() + '/features/customers/:customerId/developer/:featureName', {
      customerId: '@customerId',
      featureName: '@featureName'
    }, {
      get: {
        method: 'GET',
        cache: true
      }
    });
  }
})();
