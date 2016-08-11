(function () {
  'use strict';
  /* @ngInject */
  function AddResourceCommonServiceV2(XhrNotificationService, $translate, $q, MediaClusterServiceV2, $window, MediaServiceActivationV2) {
    var vm = this;
    vm.clusters = null;
    vm.onlineNodeList = [];
    vm.offlineNodeList = [];
    vm.clusterList = [];
    vm.selectedClusterId = '';
    vm.currentServiceId = 'squared-fusion-media';

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
            if (cluster.targetType === 'mf_mgmt') {
              vm.clusterList.push(cluster.name);
              _.each(cluster.connectors, function (connector) {
                if ('running' == connector.state) {
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
        MediaClusterServiceV2.createClusterV2(enteredCluster, 'stable').then(function (resp) {
          vm.selectedClusterId = resp.data.id;
          deferred.resolve(whiteListHost(hostName, vm.selectedClusterId));
        });
        return deferred.promise;
      } else {
        vm.selectedClusterId = vm.clusterDetail.id;
        return whiteListHost(hostName, vm.selectedClusterId);
      }
    }

    function whiteListHost(hostName, clusterId) {
      return MediaClusterServiceV2.addRedirectTarget(hostName, clusterId);
    }

    function redirectPopUpAndClose(hostName, enteredCluster, clusterId, firstTimeSetup) {
      if (firstTimeSetup) {
        MediaServiceActivationV2.enableMediaService(vm.currentServiceId);
      }
      vm.popup = $window.open('https://' + encodeURIComponent(hostName) + '/?clusterName=' + encodeURIComponent(enteredCluster) + '&clusterId=' + encodeURIComponent(vm.selectedClusterId));
    }

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
