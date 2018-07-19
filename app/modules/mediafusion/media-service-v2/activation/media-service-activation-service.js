(function () {
  'use strict';

  module.exports = MediaServiceActivationV2;

  /* @ngInject */
  function MediaServiceActivationV2($http, $q, $timeout, Authinfo, Notification, ServiceDescriptorService, Orgservice, UrlConfig) {
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

    function recoverProm(errorResponse) {
      Notification.errorWithTrackingId(errorResponse, 'mediaFusion.mediaEntitlementEnablementFailure');
      return undefined;
    }

    function enableMediaServiceEntitlements() {
      return [enableRhesosEntitlement().catch(recoverProm), enableCallServiceEntitlement().catch(recoverProm)];
    }

    function enableMediaServiceEntitlementsWizard() {
      return [enableRhesosEntitlement().catch(recoverPromFailure), enableCallServiceEntitlement().catch(recoverPromFailure)];
    }

    function recoverPromFailure(errorResponse) {
      var errormsg = Notification.getTrackingId(errorResponse);
      return errormsg;
    }

    function enableMediaService(serviceId) {
      ServiceDescriptorService.enableService(serviceId).then('', function () {
        Notification.error('mediaFusion.mediaServiceActivationFailure');
      });
      setIsMediaServiceEnabled(true);
      enableOrpheusForMediaFusion();
      setOrgSettingsForDevOps();
    }

    var enableOrpheusForMediaFusion = function () {
      getUserIdentityOrgToMediaAgentOrgMapping().then(
        function success(response) {
          var mediaAgentOrgIdsArray = [];
          var orgId = Authinfo.getOrgId();
          var updateMediaAgentOrgId = false;
          mediaAgentOrgIdsArray = response.data.mediaAgentOrgIds;

          // Irrespective of response in get we are doing put now
          // See if org id is already mapped to user org id
          // if (mediaAgentOrgIdsArray.indexOf(orgId) == -1) {
          mediaAgentOrgIdsArray.push(orgId);
          updateMediaAgentOrgId = true;
          // }
          // See if 'squared' org id is already mapped to user org id
          // if (mediaAgentOrgIdsArray.indexOf('squared') == -1) {
          mediaAgentOrgIdsArray.push('squared');
          //   updateMediaAgentOrgId = true;
          // }

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
        function success(response) {
          logUserIdentityOrgToMediaAgentOrgMapping(response, 'Calliope Auth added successfully');
        },
        function error() {
          $timeout(function () {
            //Adding a 3 sec timeout here so that on failure this API will be retried.
            //As per the flow when this call is being executed, user will will be redirected to a new tab to continue registering the node to the cloud.
            //Hence the tab won’t be closed in the given timeout period.
            setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).catch(
              function error(errorResponse) {
                logUserIdentityOrgToMediaAgentOrgMapping(errorResponse, 'Calliope Auth addition failed');
                Notification.errorWithTrackingId(errorResponse, 'mediaFusion.mediaMicroserviceFailure');
              });
          }, 3000);
        });
    };


    var getMediaServiceState = function () {
      var isMediaService = $q.defer();
      if (!_.isUndefined(vm.isMediaServiceEnabled)) {
        isMediaService.resolve(vm.isMediaServiceEnabled);
      } else {
        ServiceDescriptorService.isServiceEnabled(vm.mediaServiceId).then(function (enabled) {
          if (enabled) {
            vm.isMediaServiceEnabled = enabled;
          }
          isMediaService.resolve(vm.isMediaServiceEnabled);
        });
      }
      return isMediaService.promise;
    };

    var setIsMediaServiceEnabled = function (value) {
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

          index = mediaAgentOrgIdsArray.indexOf('squared');
          mediaAgentOrgIdsArray.splice(index, 1);

          if (mediaAgentOrgIdsArray.length > 0) {
            setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
              function success() {},
              function error(errorResponse) {
                Notification.errorWithTrackingId(errorResponse, 'mediaFusion.mediaMicroserviceFailure');
              });
          } else {
            deleteUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
              function success(response) {
                logUserIdentityOrgToMediaAgentOrgMapping(response, 'Calliope Auth deleted successfully');
              },
              function error(errorResponse) {
                Notification.errorWithTrackingId(errorResponse, 'mediaFusion.mediaMicroserviceFailure');
                logUserIdentityOrgToMediaAgentOrgMapping(errorResponse, 'Calliope Auth deletion failed');
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
        selfSubscribe: true,
        roles: ['Spark_CallService'],
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
      var payload = {
        isMediaFusionEnabled: true,
        updatedTime: moment().utc(),
      };
      var url = UrlConfig.getAthenaServiceUrl() + '/devops/organizations/' + Authinfo.getOrgId() + '/hms_org_activation';
      $http.post(url, payload);
    };

    var disableMFOrgSettingsForDevOps = function () {
      var settings = {
        isMediaFusionEnabled: false,
      };
      Orgservice.setOrgSettings(Authinfo.getOrgId(), settings);
      var payload = {
        isMediaFusionEnabled: false,
        updatedTime: moment().utc(),
      };
      var url = UrlConfig.getAthenaServiceUrl() + '/devops/organizations/' + Authinfo.getOrgId() + '/hms_org_activation';
      return $http.post(url, payload);
    };

    var logUserIdentityOrgToMediaAgentOrgMapping = function (response, info) {
      var status = response.status;
      var statusText = response.statusText;
      var message = 'Message: ' + info + ', statusCode: ' + status + ', statusText: ' + statusText;
      var trackingId = Notification.getTrackingId(response);
      var payload = {
        serviceName: 'Orpheus',
        message: message,
        trackingId: trackingId,
      };
      var url = UrlConfig.getAthenaServiceUrl() + '/devops/organizations/' + Authinfo.getOrgId() + '/log_message';
      return $http.post(url, payload);
    };

    return {
      setIsMediaServiceEnabled: setIsMediaServiceEnabled,
      getMediaServiceState: getMediaServiceState,
      getUserIdentityOrgToMediaAgentOrgMapping: getUserIdentityOrgToMediaAgentOrgMapping,
      setUserIdentityOrgToMediaAgentOrgMapping: setUserIdentityOrgToMediaAgentOrgMapping,
      deleteUserIdentityOrgToMediaAgentOrgMapping: deleteUserIdentityOrgToMediaAgentOrgMapping,
      enableMediaService: enableMediaService,
      disableOrpheusForMediaFusion: disableOrpheusForMediaFusion,
      deactivateHybridMedia: deactivateHybridMedia,
      disableMFOrgSettingsForDevOps: disableMFOrgSettingsForDevOps,
      enableMediaServiceEntitlements: enableMediaServiceEntitlements,
      enableMediaServiceEntitlementsWizard: enableMediaServiceEntitlementsWizard,
    };
  }
})();
