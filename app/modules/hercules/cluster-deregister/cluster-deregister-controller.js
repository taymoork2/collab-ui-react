(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ClusterDeregisterController', ClusterDeregisterController);

  /* @ngInject */
  function ClusterDeregisterController(cluster, FusionClusterService, XhrNotificationService, $translate, $modalInstance, isF410enabled) {
    var vm = this;
    vm.deregistering = false;
    vm.isF410enabled = isF410enabled;

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
        }, function (err) {
          vm.error = $translate.instant('hercules.clusters.deregisterErrorGeneric', {
            clusterName: cluster.name,
            errorMessage: XhrNotificationService.getMessages(err).join(', ')
          });
        })
        .finally(function () {
          vm.deregistering = false;
        });
    };
  }

}());
