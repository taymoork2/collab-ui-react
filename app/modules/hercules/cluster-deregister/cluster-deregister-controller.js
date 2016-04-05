(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ClusterDeregisterController', ClusterDeregisterController);

  /* @ngInject */
  function ClusterDeregisterController(cluster, ClusterService, XhrNotificationService, $translate, $modalInstance, $window) {
    var vm = this;
    window.x = $window;
    vm.deregisterAreYouSure = $translate.instant(
      'hercules.clusters.deregisterAreYouSure', {
        clusterName: cluster.name
      });
    vm.deregisterCausesListItem2 = $translate.instant(
      'hercules.clusters.deregisterCausesListItem2', {
        clusterName: cluster.name
      });
    vm.saving = false;
    vm.deregister = function () {
      vm.saving = true;
      ClusterService
        .deleteCluster(cluster.id)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
        }, function (err) {
          vm.error = $translate.instant(
            err.status === 409 ? 'hercules.clusters.deregisterErrorNoDeregisterSupport' : 'hercules.clusters.deregisterErrorGeneric', {
              clusterName: cluster.name,
              errorMessage: XhrNotificationService.getMessages(err).join(', ')
            });
          vm.saving = false;
        });
      return false;
    };

    vm.close = $modalInstance.close;
  }

}());
