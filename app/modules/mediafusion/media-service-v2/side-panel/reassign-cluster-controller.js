(function () {
  'use strict';

  /* @ngInject */
  function ReassignClusterControllerV2(cluster, connector, MediaClusterServiceV2, XhrNotificationService, $translate, $modalInstance) {
    var vm = this;

    vm.options = [];
    vm.selectPlaceholder = 'Select a Cluster';
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

    vm.reassign = function () {
      vm.saving = true;

      _.each(vm.clusters, function (cluster) {
        if (cluster.name == vm.selectedCluster) {
          vm.clusterDetail = cluster;
        }
      });

      MediaClusterServiceV2.moveV2Host(connector.id, cluster.id, vm.clusterDetail.id).then(function () {
        $modalInstance.close();
        vm.saving = false;
      }, function (err) {
        vm.error = $translate.instant('mediaFusion.reassign.reassignErrorMessage', {
          hostName: vm.selectedCluster,
          errorMessage: XhrNotificationService.getMessages(err).join(', ')
        });
        vm.saving = false;
      });
      return false;
    };

    vm.close = $modalInstance.close;
  }

  angular
    .module('Mediafusion')
    .controller('ReassignClusterControllerV2', ReassignClusterControllerV2);

}());
