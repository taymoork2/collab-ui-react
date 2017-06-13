(function () {
  'use strict';

  angular.module('Mediafusion')
    .service('MediaServiceActivationV2', MediaServiceActivationV2);

  /* @ngInject */
  function MediaServiceActivationV2($http, UrlConfig, Authinfo, Notification, $q, HybridServicesClusterService, ServiceDescriptor, Orgservice) {
    var vm = this;
    vm.mediaServiceId = 'squared-fusion-media';


    var getUserIdentityOrgToMediaAgentOrgMapping = function () {
      var url = UrlConfig.getCalliopeUrl() + '/identity2agent/' + Authinfo.getOrgId();
      return $http.get(url);
    };

    var setUserIdentityOrgToMediaAgentOrgMapping = function (mediaAgentOrgIdsArray) {
      var url = UrlConfig.getCalliopeUrl() + '/identity2agent';
      return $http
        .put(url, {
          identityOrgId: Authinfo.getOrgId(),
          mediaAgentOrgIds: mediaAgentOrgIdsArray,
        });
    };

    var deleteUserIdentityOrgToMediaAgentOrgMapping = function () {
      var url = UrlConfig.getCalliopeUrl() + '/identity2agent/' + Authinfo.getOrgId();
      return $http.delete(url);
    };


    function enableMediaService(serviceId) {
      ServiceDescriptor.enableService(serviceId).then(
        function success() {
          setisMediaServiceEnabled(true);
          enableOrpheusForMediaFusion();
          enableRhesosEntitlement();
          enableCallServiceEntitlement();
          setOrgSettingsForDevOps();
        },
        function error() {
          Notification.error('mediaFusion.mediaServiceActivationFailure');
        });
    }

    var enableOrpheusForMediaFusion = function () {
      getUserIdentityOrgToMediaAgentOrgMapping().then(
        function success(response) {
          var mediaAgentOrgIdsArray = [];
          var orgId = Authinfo.getOrgId();
          var updateMediaAgentOrgId = false;
          mediaAgentOrgIdsArray = response.data.mediaAgentOrgIds;

          // See if org id is already mapped to user org id
          if (mediaAgentOrgIdsArray.indexOf(orgId) == -1) {
            mediaAgentOrgIdsArray.push(orgId);
            updateMediaAgentOrgId = true;
          }
          // See if 'squared' org id is already mapped to user org id
          if (mediaAgentOrgIdsArray.indexOf('squared') == -1) {
            mediaAgentOrgIdsArray.push('squared');
            updateMediaAgentOrgId = true;
          }

          if (updateMediaAgentOrgId) {
            addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIdsArray);
          }
        },

        function error() {
          // Unable to find identityOrgId, add identityOrgId -> mediaAgentOrgId mapping
          var mediaAgentOrgIdsArray = [];
          mediaAgentOrgIdsArray.push(Authinfo.getOrgId());
          mediaAgentOrgIdsArray.push('squared');
          addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIdsArray);
        });
    };

    var addUserIdentityToMediaAgentOrgMapping = function (mediaAgentOrgIdsArray) {
      setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
        function success() {},
        function error(errorResponse) {
          Notification.error('mediaFusion.mediaAgentOrgMappingFailure', {
            failureMessage: errorResponse.message,
          });
        });
    };


    var getMediaServiceState = function () {
      var isMediaService = $q.defer();
      if (!_.isUndefined(vm.isMediaServiceEnabled)) {
        isMediaService.resolve(vm.isMediaServiceEnabled);
      } else {
        HybridServicesClusterService.serviceIsSetUp(vm.mediaServiceId).then(function (enabled) {
          if (enabled) {
            vm.isMediaServiceEnabled = enabled;
          }
          isMediaService.resolve(vm.isMediaServiceEnabled);
        });
      }
      return isMediaService.promise;
    };

    var setisMediaServiceEnabled = function (value) {
      vm.isMediaServiceEnabled = value;
    };

    var disableOrpheusForMediaFusion = function () {
      getUserIdentityOrgToMediaAgentOrgMapping().then(
        function success(response) {
          var mediaAgentOrgIdsArray = [];
          var orgId = Authinfo.getOrgId();
          mediaAgentOrgIdsArray = response.data.mediaAgentOrgIds;

          var index = mediaAgentOrgIdsArray.indexOf(orgId);
          mediaAgentOrgIdsArray.splice(index, 1);

          index = mediaAgentOrgIdsArray.indexOf("squared");
          mediaAgentOrgIdsArray.splice(index, 1);

          if (mediaAgentOrgIdsArray.length > 0) {
            setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
              function success() {},
              function error(errorResponse) {
                Notification.error('mediaFusion.mediaAgentOrgMappingFailure', {
                  failureMessage: errorResponse.message,
                });
              });
          } else {
            deleteUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
              function success() {},
              function error(errorResponse) {
                Notification.error('mediaFusion.mediaAgentOrgMappingFailure', {
                  failureMessage: errorResponse.message,
                });
              });
          }
        });
    };

    var deactivateHybridMedia = function () {
      var url = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId() + '/deactivate_hybrid_media';
      return $http.delete(url);
    };

    var enableRhesosEntitlement = function () {
      var url = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/services/rhesos';
      return $http.post(url);
    };

    var enableCallServiceEntitlement = function () {
      var payload = {
        "selfSubscribe": true,
        "roles": ["Spark_CallService"],
      };
      var url = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/services/spark';
      return $http.post(url, payload);
    };

    var setOrgSettingsForDevOps = function () {
      var settings = {
        isMediaFusionEnabled: true,
        mediaFusionEnabledAt: moment().utc(),
      };
      Orgservice.setOrgSettings(Authinfo.getOrgId(), settings);
    };

    var disableMFOrgSettingsForDevOps = function () {
      var settings = {
        isMediaFusionEnabled: false,
      };
      Orgservice.setOrgSettings(Authinfo.getOrgId(), settings);
    };

    return {
      setisMediaServiceEnabled: setisMediaServiceEnabled,
      getMediaServiceState: getMediaServiceState,
      getUserIdentityOrgToMediaAgentOrgMapping: getUserIdentityOrgToMediaAgentOrgMapping,
      setUserIdentityOrgToMediaAgentOrgMapping: setUserIdentityOrgToMediaAgentOrgMapping,
      deleteUserIdentityOrgToMediaAgentOrgMapping: deleteUserIdentityOrgToMediaAgentOrgMapping,
      enableMediaService: enableMediaService,
      disableOrpheusForMediaFusion: disableOrpheusForMediaFusion,
      deactivateHybridMedia: deactivateHybridMedia,
      disableMFOrgSettingsForDevOps: disableMFOrgSettingsForDevOps,
    };
  }
})();
