(function () {
  'use strict';

  angular
    .module('HDS')
    .service('HDSAddResourceCommonService', HDSAddResourceCommonService);

  /* @ngInject */
  function HDSAddResourceCommonService(Notification, $translate, $q, FusionClusterService, $window, HDSServiceActivation, Authinfo) {
    var vm = this;
    vm.clusters = null;
    vm.onlineNodeList = [];
    vm.offlineNodeList = [];
    vm.clusterList = [];
    vm.selectedClusterId = '';
    vm.currentServiceId = 'spark-hybrid-datasecurity';
    vm.fusionClusterService = FusionClusterService;
    vm.orgId = Authinfo.getOrgId();

    function updateClusterLists() {
      vm.clusters = null;
      vm.clusterList = [];
      vm.onlineNodeList = [];
      vm.offlineNodeList = [];
      var deferred = $q.defer();
      vm.fusionClusterService.getAll(vm.orgId)
        .then(function (clusters) {
          vm.clusters = _.filter(clusters, { targetType: 'hds_app' });
          _.each(clusters, function (cluster) {
            if (cluster.targetType === 'hds_app') {
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

        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hds.genericError');
        });
      return deferred.promise;
    }

    function addRedirectTargetClicked(hostName, enteredCluster) {
      vm.clusterDetail = null;
      //Checking if the host is already present
      if (vm.onlineNodeList.indexOf(hostName) > -1) {
        Notification.error('hds.add-resource-dialog.serverOnline');
        return;
      }

      if (vm.offlineNodeList.indexOf(hostName) > -1) {
        Notification.error('hds.add-resource-dialog.serverOffline');
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
        //TODO: fix for fusion cluster
        vm.fusionClusterService.preregisterCluster(enteredCluster, 'stable', 'hds_app')
        .then(function (resp) {
          vm.selectedClusterId = resp.data.id;
          deferred.resolve(whiteListHost(hostName, vm.selectedClusterId));
        })
        .catch(function (error) {
          var errorMessage = $translate.instant('hds.clusters.clusterCreationFailed', {
            enteredCluster: enteredCluster
          });
          Notification.errorWithTrackingId(error, errorMessage);
        });
        return deferred.promise;
      } else {
        vm.selectedClusterId = vm.clusterDetail.id;
        return whiteListHost(hostName, vm.selectedClusterId);
      }
    }

    function whiteListHost(hostName, clusterId) {
      return vm.fusionClusterService.addPreregisteredClusterToAllowList(hostName, 3600, clusterId);
    }

    function redirectPopUpAndClose(hostName, enteredCluster, clusterId, firstTimeSetup) {
      if (firstTimeSetup) {
        HDSServiceActivation.enableHdsService('spark-hybrid-datasecurity');
      }
      vm.popup = $window.open('https://' + encodeURIComponent(hostName) + '/?clusterName=' + encodeURIComponent(enteredCluster) + '&clusterId=' + encodeURIComponent(vm.selectedClusterId));
    }

    return {
      addRedirectTargetClicked: addRedirectTargetClicked,
      updateClusterLists: updateClusterLists,
      redirectPopUpAndClose: redirectPopUpAndClose
    };

  }
}());
