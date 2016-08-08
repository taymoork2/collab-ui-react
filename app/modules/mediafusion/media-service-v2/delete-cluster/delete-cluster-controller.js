(function () {
  'use strict';

  /* @ngInject */
  function DeleteClusterSettingControllerV2(cluster, $modalInstance, $filter, MediaClusterServiceV2, $state, $translate, XhrNotificationService, Notification) {
    var vm = this;
    vm.selectPlaceholder = 'Select a cluster';
    vm.options = [];
    vm.close = $modalInstance.close;
    vm.selectModel = {};
    vm.fillModel = {};
    vm.radioModel = '1';
    vm.checkboxModel = false;
    vm.isMove = true;
    vm.successCount = 0;
    vm.errorCount = 0;
    vm.failedHostMove = [];
    vm.failedToDelete = false;
    vm.hosts = '';
    vm.ngDisable = false;

    vm.deleteAreYouSure = $translate.instant(
      'mediaFusion.deleteGroup.message', {
        groupName: cluster.name
      });

    MediaClusterServiceV2.getAll()
      .then(function (clusters) {
        vm.clusters = _.filter(clusters, 'targetType', 'mf_mgmt');
        _.each(clusters, function (clust) {
          if (cluster.id != clust.id) {
            vm.options.push(clust.name);
          }
        });
        vm.options.sort();
      });

    MediaClusterServiceV2.get(cluster.id).then(function (response) {
      vm.cluster = response;
      vm.hosts = vm.cluster.connectors;
      vm.noOfHost = vm.hosts.length;
      for (var i = 0; i < vm.hosts.length; i++) {
        var key = vm.hosts[i].hostname;
        var value = vm.selectPlaceholder;
        vm.selectModel[key] = value;
        vm.fillModel[key] = false;
      }
    });

    vm.continue = function () {
      for (var i = 0; i < vm.hosts.length; i++) {
        var key = vm.hosts[i].hostname;
        vm.fillModel[key] = false;
        if (vm.selectModel[key] == vm.selectPlaceholder) {
          vm.fillModel[key] = true;
          vm.isMove = false;
        }
      }
      if (vm.isMove) {
        if (vm.hosts.length == 0) {
          deleteCluster();
          return;
        }
        moveNodesTocluster();
      }
      vm.isMove = true;
    };

    vm.deleteCluster = function () {
      //this is to deregister all host and delete cluster
      for (var i = 0; i < vm.hosts.length; i++) {
        defuseHost(vm.hosts[i]);
      }
    };

    function defuseHost(host) {
      MediaClusterServiceV2.defuseV2Connector(host.id).success(incrementSuccessCount(host)).error(incrementFailureCount(host));
    }

    function moveNodesTocluster() {

      for (var i = 0; i < vm.hosts.length; i++) {
        var hostname = vm.hosts[i].hostname;
        var toClusterName = vm.selectModel[hostname];
        moveHost(hostname, toClusterName);
      }
    }

    function moveHost(hostname, toClusterName) {
      var host;
      var fromCluster;
      var toCluster;

      host = $filter('filter')(vm.hosts, {
        'hostname': hostname
      }, true)[0];

      toCluster = $filter('filter')(vm.clusters, {
        'name': toClusterName
      }, true)[0];

      fromCluster = vm.cluster;
      MediaClusterServiceV2.moveV2Host(host.id, fromCluster.id, toCluster.id).success(incrementSuccessCount(host, toCluster)).error(incrementFailureCount(host));
    }

    function incrementSuccessCount(host, toCluster) {
      return function () {
        vm.successCount++;
        vm.successMove = $translate.instant('mediaFusion.clusters.movedTo', {
          nodeName: host.hostname,
          clusterName: toCluster.name
        });
        Notification.notify(vm.successMove, 'success');
        deleteCluster();
      };
    }

    function incrementFailureCount(host) {
      return function () {
        vm.errorCount++;
        vm.failedHostMove.push(host.hostname);
        deleteCluster();
      };
    }

    function deleteCluster() {
      if (vm.successCount == vm.noOfHost) {
        MediaClusterServiceV2.deleteV2Cluster(vm.cluster.id).then(function (res) {
          vm.success = $translate.instant('mediaFusion.clusters.clusterdeleteSuccess', {
            clustername: vm.cluster.name,
            errorMessage: XhrNotificationService.getMessages(res).join(', ')
          });
          Notification.notify(vm.success, 'success');
          $modalInstance.close();
          $state.go("media-service-v2.list");
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.deleteGroup.errorMessage', {
            groupName: vm.cluster.name,
            errorMessage: XhrNotificationService.getMessages(err).join(', ')
          });
          Notification.notify(vm.error, 'error');
        });
      } else if ((vm.successCount + vm.errorCount) == vm.noOfHost) {
        vm.failedToDelete = true;
        vm.ngDisable = true;
        var nodesString = '';
        angular.forEach(vm.failedHostMove, function (value) {
          nodesString = value + ', ' + nodesString;
        });
        vm.unableToMoveNodes = $translate.instant(
          'mediaFusion.clusters.unabletomovenodes', {
            nodes: nodesString
          });
      }
    }

  }

  angular
    .module('Mediafusion')
    .controller('DeleteClusterSettingControllerV2', DeleteClusterSettingControllerV2);

}());
