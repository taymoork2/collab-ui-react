(function () {
  'use strict';

  angular
    .module("Mediafusion")
    .controller("RedirectAddResourceControllerV2", RedirectAddResourceControllerV2);

  /* @ngInject */
  function RedirectAddResourceControllerV2(MediaClusterServiceV2, $modalInstance, $window, XhrNotificationService, $log, $translate) {
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
      $modalInstance.close();
      vm.popup = $window.open("https://" + encodeURIComponent(hostName) + "/?clusterName=" + encodeURIComponent(enteredCluster) + "&clusterId=" + encodeURIComponent(clusterId));
      if (!vm.popup || vm.popup.closed || typeof vm.popup.closed == 'undefined') {
        $log.log('popup.closed');
      }
    }

    function back() {
      vm.enableRedirectToTarget = false;
      vm.createNewCluster = false;
    }
  }
}());
