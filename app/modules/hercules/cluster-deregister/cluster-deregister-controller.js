(function () {
  'use strict';

  /* @ngInject */
  function ClusterDeregisterController(cluster, ClusterService, XhrNotificationService, $translate, $modalInstance, $window) {
    var vm = this;
    window.x = $window;
    vm.deregisterAreYouSure = $translate.instant(
      'hercules.clusters.deregisterAreYouSure', {
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
          if (err.status === 409) {
            vm.error = $translate.instant(
              'hercules.clusters.deregisterErrorNoDeregisterSupport');
          } else {
            vm.error = $translate.instant(
              'hercules.clusters.deregisterErrorGeneric', {
                errorMessage: XhrNotificationService.getMessages(err).join(', ')
              });
          }
          vm.saving = false;
        });
      return false;
    };

    vm.close = $modalInstance.close;
  }

  angular
    .module('Hercules')
    .controller('ClusterDeregisterController', ClusterDeregisterController);

}());
