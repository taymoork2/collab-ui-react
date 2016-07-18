(function () {
  'use strict';

  angular
    .module("Mediafusion")
    .controller("RedirectAddResourceControllerV2", RedirectAddResourceControllerV2);

  /* @ngInject */
  function RedirectAddResourceControllerV2(MediaClusterServiceV2, $modalInstance, $window, XhrNotificationService, $log, $translate, firstTimeSetup, $modal, $state, MediaServiceActivationV2, Notification, Authinfo) {
    var vm = this;
    vm.clusterList = [];
    vm.onlineNodeList = [];
    vm.offlineNodeList = [];
    vm.clusters = null;
    vm.groups = null;
    vm.combo = true;
    vm.selectPlaceholder = 'Add new / Select existing Cluster';
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.redirectPopUpAndClose = redirectPopUpAndClose;
    vm.back = back;
    //vm.getV2Clusters = getV2Clusters;
    vm.whiteListHost = whiteListHost;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.clusterDetail = null;
    vm.popup = '';
    vm.createNewCluster = false;
    vm.selectedClusterId = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    vm.currentServiceId = "squared-fusion-media";
    vm.enableMediaService = enableMediaService;
    vm.radio = 1;

    // Forming clusterList which contains all cluster name of type mf_mgmt and sorting it.
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
      }, XhrNotificationService.notify);

    function addRedirectTargetClicked(hostName, enteredCluster) {

      //Checking if the host is already present
      if (vm.onlineNodeList.indexOf(hostName) > -1) {
        $modalInstance.close();
        XhrNotificationService.notify($translate.instant('mediaFusion.add-resource-dialog.serverOnline'));
      }

      if (vm.offlineNodeList.indexOf(hostName) > -1) {
        $modalInstance.close();
        XhrNotificationService.notify($translate.instant('mediaFusion.add-resource-dialog.serverOffline'));
      }

      //Checking if value in selected cluster is in cluster list
      _.each(vm.clusters, function (cluster) {
        if (cluster.name == vm.selectedCluster) {
          vm.clusterDetail = cluster;
        }
      });
      if (vm.clusterDetail == null) {
        MediaClusterServiceV2.createClusterV2(enteredCluster, 'GA').then(function (resp) {
          vm.selectedClusterId = resp.data.id;
          vm.whiteListHost(hostName, vm.selectedClusterId);
          //vm.redirectPopUpAndClose(hostName, enteredCluster, resp.data.id);
        });
      } else {
        vm.selectedClusterId = vm.clusterDetail.id;
        vm.whiteListHost(hostName, vm.selectedClusterId);
        //vm.redirectPopUpAndClose(hostName, enteredCluster, vm.clusterDetail.id);
      }
    }

    function whiteListHost(hostName, clusterId) {
      MediaClusterServiceV2.addRedirectTarget(hostName, clusterId).then(function () {
        vm.enableRedirectToTarget = true;
        $log.log("value is set ", vm.enableRedirectToTarget);
      }, XhrNotificationService.notify);
    }

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      vm.redirectPopUpAndClose(hostName, enteredCluster, vm.selectedClusterId);
    }

    function redirectPopUpAndClose(hostName, enteredCluster, clusterId) {
      if (firstTimeSetup) {
        enableMediaService(vm.currentServiceId);
      }
      $modalInstance.close();
      vm.popup = $window.open("https://" + encodeURIComponent(hostName) + "/?clusterName=" + encodeURIComponent(enteredCluster) + "&clusterId=" + encodeURIComponent(clusterId));
      if (!vm.popup || vm.popup.closed || typeof vm.popup.closed == 'undefined') {
        $log.log('popup.closed');
      }
    }

    function closeSetupModal() {
      if (!firstTimeSetup) {
        $modalInstance.close();
        return;
      }
      $modal.open({
          templateUrl: 'modules/hercules/add-resource/confirm-setup-cancel-dialog.html',
          type: 'dialog'
        })
        .result.then(function (isAborting) {
          if (isAborting) {
            $modalInstance.close();
            $state.go('services-overview');
          }
        });
    }

    function enableMediaService(serviceId) {
      vm.waitForEnabled = true;
      MediaServiceActivationV2.setServiceEnabled(serviceId, true).then(
        function success() {
          vm.enableOrpheusForMediaFusion();
        },
        function error(data, status) {
          Notification.notify($translate.instant('mediaFusion.mediaServiceActivationFailure'));
        });
      vm.serviceEnabled = true;
      vm.waitForEnabled = false;
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
          Notification.notify([$translate.instant('mediaFusion.mediaAgentOrgMappingFailure', {
            failureMessage: errorResponse.message
          })], 'error');
        });
    };

    function back() {
      vm.enableRedirectToTarget = false;
      vm.createNewCluster = false;
    }
  }
}());
