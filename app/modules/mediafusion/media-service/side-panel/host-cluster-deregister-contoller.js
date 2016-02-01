(function () {
  'use strict';

  /* @ngInject */
  function HostClusterDeregisterController(cluster, MediaClusterService, XhrNotificationService, $translate, $modalInstance, $window, $log) {
    var vm = this;
    window.x = $window;
    vm.deregisterAreYouSure = $translate.instant(
      'mediaFusion.clusters.defuseAreYouSure', {
        clusterName: cluster.name
      });

    vm.deregisterItem1 = $translate.instant(
      'mediaFusion.clusters.defuseCausesListItem1', {
        clusterName: cluster.name
      });
    vm.saving = false;

    vm.deleteCluster = function () {
      MediaClusterService
        .deleteGroup(cluster.assigned_property_sets)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.clusters.deregisterErrorGeneric', {
            clusterName: cluster.name,
            errorMessage: XhrNotificationService.getMessages(err).join(', ')
          });
          vm.saving = false;
        });
      return false;
    };

    vm.deregister = function () {
      vm.saving = true;
      MediaClusterService
        .deleteCluster(cluster.id)
        .then(function () {
          vm.deleteCluster();
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.clusters.deregisterErrorGeneric', {
            clusterName: cluster.name,
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
    .controller('HostClusterDeregisterController', HostClusterDeregisterController);

}());