(function () {
  'use strict';

  /* @ngInject */
  function ReassignClusterControllerV2(cluster, connector, MediaClusterServiceV2, XhrNotificationService, $translate, $modalInstance, Notification) {
    var vm = this;

    vm.options = [];
    vm.selectPlaceholder = $translate.instant('mediaFusion.add-resource-dialog.cluster-placeholder');
    vm.selectedCluster = '';
    vm.groups = null;
    vm.groupResponse = null;
    vm.clusterDetail = null;

    MediaClusterServiceV2.getAll()
      .then(function (clusters) {
        vm.clusters = _.filter(clusters, 'targetType', 'mf_mgmt');
        _.each(clusters, function (clust) {
          vm.options.push(clust.name);
        });
        vm.options.sort();
      }, XhrNotificationService.notify);

    vm.reassignText = $translate.instant(
      'mediaFusion.reassign.reassignTextV2', {
        clusterName: connector.hostname,
        displayName: cluster.name
      });
    vm.saving = false;
    vm.canContinue = function () {
      if (vm.selectedCluster == vm.selectPlaceholder || vm.selectedCluster == '') {
        return false;
      }
      return true;
    };

    vm.reassign = function () {
      vm.saving = true;

      _.each(vm.clusters, function (cluster) {
        if (cluster.name == vm.selectedCluster) {
          vm.clusterDetail = cluster;
        }
      });

      if (vm.clusterDetail == null) {
        MediaClusterServiceV2.createClusterV2(vm.selectedCluster, 'stable').then(function (res) {
          vm.clusterDetail = res.data;
          moveHost(res);
        }, function () {
          vm.error = $translate.instant('mediaFusion.reassign.reassignErrorMessage', {
            hostName: vm.selectedCluster
          });
          Notification.error(vm.error);

        });
      } else {
        moveHost();
      }
    };
    function moveHost() {
      MediaClusterServiceV2.moveV2Host(connector.id, cluster.id, vm.clusterDetail.id).then(function () {
        $modalInstance.close();
        Notification.success('mediaFusion.moveHostSuccess');
      }, function (err) {
        vm.error = $translate.instant('mediaFusion.reassign.reassignErrorMessage', {
          hostName: vm.selectedCluster,
          errorMessage: XhrNotificationService.getMessages(err).join(', ')
        });
      });

    }
    vm.close = $modalInstance.close;
  }

  angular
    .module('Mediafusion')
    .controller('ReassignClusterControllerV2', ReassignClusterControllerV2);

}());
