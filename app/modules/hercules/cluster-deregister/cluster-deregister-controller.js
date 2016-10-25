(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ClusterDeregisterController', ClusterDeregisterController);

  /* @ngInject */
  function ClusterDeregisterController(cluster, FusionClusterService, Notification, $translate, $modalInstance) {
    var vm = this;
    vm.deregistering = false;

    vm.deregisterAreYouSure = $translate.instant(
      'hercules.clusters.deregisterAreYouSure', {
        clusterName: cluster.name
      });

    vm.deregisterCausesListItem2 = $translate.instant(
      'hercules.clusters.deregisterCausesListItem2', {
        clusterName: cluster.name
      });

    vm.deregister = function () {
      vm.deregistering = true;
      FusionClusterService
        .deregisterCluster(cluster.id)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.clusters.deregisterErrorGeneric', {
            clusterName: cluster.name
          });
        })
        .finally(function () {
          vm.deregistering = false;
        });
    };
  }

}());
