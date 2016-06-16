(function () {
  'use strict';

  angular
    .module("Mediafusion")
    .controller("RedirectAddResourceControllerV2", RedirectAddResourceControllerV2);

  /* @ngInject */
  function RedirectAddResourceControllerV2(RedirectTargetService, MediaClusterServiceV2, $modalInstance, $window, XhrNotificationService, $log, $modal) {
    var vm = this;
    vm.clusterList = [];
    vm.onlineClusterList = [];
    vm.offlineClusterList = [];
    vm.clusters = null;
    vm.groups = null;
    vm.combo = true;
    vm.selectPlaceholder = 'Add new / Select existing Cluster';
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.redirectPopUpAndClose = redirectPopUpAndClose;
    vm.back = back;
    vm.getV2Clusters = getV2Clusters;
    vm.whiteListHost = whiteListHost;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.clusterDetail = null;
    vm.popup = '';
    vm.createNewCluster = false;
    vm.selectedClusterId = '';

    function getV2Clusters() {
      vm.clusters = MediaClusterServiceV2.getClustersV2().then(function (cluster) {
        vm.clusters = cluster.clusters;
        _.each(cluster.clusters, function (cluster) {
          if (cluster.targetType === "mf_mgmt") {
            vm.clusterList.push(cluster.name);
          }
        });
      });
    }
    vm.getV2Clusters();

    function addRedirectTargetClicked(hostName, enteredCluster) {

      //Checking if value in selected cluster is in cluster list
      _.each(vm.clusters, function (cluster) {
        if (cluster.name == vm.selectedCluster) {
          vm.clusterDetail = cluster;
        }
      });
      $log.log("the value of clusterDetail is ", vm.clusterDetail);
      if (vm.clusterDetail == null) {
        MediaClusterServiceV2.createClusterV2(enteredCluster, 'GA').then(function (resp) {
          $log.log("Reponse is ", resp);
          vm.selectedClusterId = resp.data.id;
          vm.whiteListHost(hostName, vm.selectedClusterId);
          //vm.redirectPopUpAndClose(hostName, enteredCluster, resp.data.id);
        });
      } else {
        vm.selectedClusterId = vm.clusterDetail.id;
        vm.whiteListHost(hostName, vm.selectedClusterId);
        //vm.redirectPopUpAndClose(hostName, enteredCluster, vm.clusterDetail.id);
      }

      /*RedirectTargetService.addRedirectTarget(hostName).then(function () {

        vm.enableRedirectToTarget = true;
        _.each(vm.clusters, function (cluster) {
          if (cluster.name == vm.selectedCluster) {
            vm.clusterDetail = cluster;
          }
        });
        if (vm.clusterDetail == null) {
          vm.createNewCluster = true;
        }
      }, XhrNotificationService.notify);*/
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
