(function () {
  'use strict';

  angular.module('Mediafusion')
    .service('MediaServiceActivationV2', MediaServiceActivationV2);

  /* @ngInject */
  function MediaServiceActivationV2($http, MediaConfigServiceV2, Authinfo, Notification, $q) {
    var vm = this;
    vm.mediaServiceId = 'squared-fusion-media';

    var setServiceEnabled = function (serviceId, enabled) {
      return $http
        .patch(MediaConfigServiceV2.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          enabled: enabled
        });

    };

    var setServiceAcknowledged = function (serviceId, acknowledged) {
      return $http
        .patch(MediaConfigServiceV2.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          acknowledged: acknowledged
        });

    };

    var isServiceEnabled = function (serviceId, callback) {
      $http
        .get(MediaConfigServiceV2.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services')
        .success(function (data) {
          var service = _.find(data.items, {
            id: serviceId
          });
          if (service === undefined) {
            callback(false);
          } else {
            callback(null, service.enabled);
          }
        })
        .error(function () {
          callback(arguments);
        });
    };

    var getUserIdentityOrgToMediaAgentOrgMapping = function () {
      var url = MediaConfigServiceV2.getCalliopeUrl() + '/identity2agent/' + Authinfo.getOrgId();
      return $http.get(url);
    };

    var setUserIdentityOrgToMediaAgentOrgMapping = function (mediaAgentOrgIdsArray) {
      var url = MediaConfigServiceV2.getCalliopeUrl() + '/identity2agent';
      return $http
        .put(url, {
          identityOrgId: Authinfo.getOrgId(),
          mediaAgentOrgIds: mediaAgentOrgIdsArray
        });
    };

    var deleteUserIdentityOrgToMediaAgentOrgMapping = function () {
      var url = MediaConfigServiceV2.getCalliopeUrl() + '/identity2agent/' + Authinfo.getOrgId();
      return $http.delete(url);
    };


    function enableMediaService(serviceId) {
      this.setServiceEnabled(serviceId, true).then(
        function success() {
          this.setisMediaServiceEnabled(true);
          enableOrpheusForMediaFusion();
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
            failureMessage: errorResponse.message
          });
        });
    };


    var getMediaServiceState = function () {
      var isMediaService = $q.defer();
      if (angular.isDefined(vm.isMediaServiceEnabled)) {
        isMediaService.resolve(vm.isMediaServiceEnabled);
      } else {
        this.isServiceEnabled(vm.mediaServiceId, function (error, enabled) {
          if (!error) {
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

    return {
      setisMediaServiceEnabled: setisMediaServiceEnabled,
      getMediaServiceState: getMediaServiceState,
      isServiceEnabled: isServiceEnabled,
      setServiceEnabled: setServiceEnabled,
      setServiceAcknowledged: setServiceAcknowledged,
      getUserIdentityOrgToMediaAgentOrgMapping: getUserIdentityOrgToMediaAgentOrgMapping,
      setUserIdentityOrgToMediaAgentOrgMapping: setUserIdentityOrgToMediaAgentOrgMapping,
      deleteUserIdentityOrgToMediaAgentOrgMapping: deleteUserIdentityOrgToMediaAgentOrgMapping,
      enableMediaService: enableMediaService
    };
  }
})();
