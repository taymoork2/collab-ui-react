(function () {
  'use strict';
  /* @ngInject */
  function AddResourceCommonServiceV2(XhrNotificationService, $translate, $q, MediaClusterServiceV2, Authinfo, $window, MediaServiceActivationV2, Notification) {
    var vm = this;
    vm.clusters = null;
    vm.onlineNodeList = [];
    vm.offlineNodeList = [];
    vm.clusterList = [];
    vm.selectedClusterId = '';
    vm.currentServiceId = "squared-fusion-media";

    // Forming clusterList which contains all cluster name of type mf_mgmt and sorting it.
    function updateClusterLists() {
      vm.clusters = null;
      vm.clusterList = [];
      vm.onlineNodeList = [];
      vm.offlineNodeList = [];
      var deferred = $q.defer();
      MediaClusterServiceV2.getAll()
        .then(function (clusters) {
          vm.clusters = _.filter(clusters, 'targetType', 'mf_mgmt');
          _.each(clusters, function (cluster) {
            if (cluster.targetType === "mf_mgmt") {
              vm.clusterList.push(cluster.name);
              _.each(cluster.connectors, function (connector) {
                if ("running" == connector.state) {
                  vm.onlineNodeList.push(connector.hostname);
                } else {
                  vm.offlineNodeList.push(connector.hostname);
                }
              });
            }
          });
          vm.clusterList.sort();
          deferred.resolve(vm.clusterList);

        }, XhrNotificationService.notify);
      return deferred.promise;
    }

    function addRedirectTargetClicked(hostName, enteredCluster) {
      vm.clusterDetail = null;
      //Checking if the host is already present
      if (vm.onlineNodeList.indexOf(hostName) > -1) {
        XhrNotificationService.notify($translate.instant('mediaFusion.add-resource-dialog.serverOnline'));
        return;
      }

      if (vm.offlineNodeList.indexOf(hostName) > -1) {
        XhrNotificationService.notify($translate.instant('mediaFusion.add-resource-dialog.serverOffline'));
        return;
      }

      //Checking if value in selected cluster is in cluster list
      _.each(vm.clusters, function (cluster) {
        if (cluster.name == enteredCluster) {
          vm.clusterDetail = cluster;
        }
      });
      if (vm.clusterDetail == null) {
        var deferred = $q.defer();
        MediaClusterServiceV2.createClusterV2(enteredCluster, 'GA').then(function (resp) {
          vm.selectedClusterId = resp.data.id;
          // return whiteListHost(hostName, vm.selectedClusterId);
          deferred.resolve(whiteListHost(hostName, vm.selectedClusterId));
        });
        return deferred.promise;
      } else {
        vm.selectedClusterId = vm.clusterDetail.id;
        return whiteListHost(hostName, vm.selectedClusterId);
        //vm.redirectPopUpAndClose(hostName, enteredCluster, vm.clusterDetail.id);
      }
    }

    function whiteListHost(hostName, clusterId) {
      return MediaClusterServiceV2.addRedirectTarget(hostName, clusterId);
    }

    function redirectPopUpAndClose(hostName, enteredCluster, clusterId, firstTimeSetup) {
      if (firstTimeSetup) {
        enableMediaService(vm.currentServiceId);
      }
      vm.popup = $window.open("https://" + encodeURIComponent(hostName) + "/?clusterName=" + encodeURIComponent(enteredCluster) + "&clusterId=" + encodeURIComponent(vm.selectedClusterId));
    }

    function enableMediaService(serviceId) {
      MediaServiceActivationV2.setServiceEnabled(serviceId, true).then(
        function success() {
          vm.enableOrpheusForMediaFusion();
        },
        function error(data, status) {
          Notification.error('mediaFusion.mediaServiceActivationFailure');
        });
    }

    vm.enableOrpheusForMediaFusion = function () {
      MediaServiceActivationV2.getUserIdentityOrgToMediaAgentOrgMapping().then(
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
          // See if "squared" org id is already mapped to user org id
          if (mediaAgentOrgIdsArray.indexOf("squared") == -1) {
            mediaAgentOrgIdsArray.push("squared");
            updateMediaAgentOrgId = true;
          }

          if (updateMediaAgentOrgId) {
            vm.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIdsArray);
          }
        },

        function error(errorResponse, status) {
          // Unable to find identityOrgId, add identityOrgId -> mediaAgentOrgId mapping
          var mediaAgentOrgIdsArray = [];
          mediaAgentOrgIdsArray.push(Authinfo.getOrgId());
          mediaAgentOrgIdsArray.push("squared");
          vm.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIdsArray);
        });
    };

    vm.addUserIdentityToMediaAgentOrgMapping = function (mediaAgentOrgIdsArray) {
      MediaServiceActivationV2.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
        function success(response) {},
        function error(errorResponse, status) {
          Notification.error('mediaFusion.mediaAgentOrgMappingFailure', {
            failureMessage: errorResponse.message
          });
        });
    };

    return {
      addRedirectTargetClicked: addRedirectTargetClicked,
      updateClusterLists: updateClusterLists,
      redirectPopUpAndClose: redirectPopUpAndClose
    };

  }
  angular
    .module('Mediafusion')
    .service('AddResourceCommonServiceV2', AddResourceCommonServiceV2);

}());
