(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ClusterDeregisterController', ClusterDeregisterController);

  /* @ngInject */
  function ClusterDeregisterController(Authinfo, cluster, FusionClusterService, Notification, $modalInstance, $translate) {
    var vm = this;
    vm.clustername = cluster.name;
    vm.companyName = Authinfo.getOrgName();
    vm.loading = false;

    vm.deregister = function () {
      vm.loading = true;
      FusionClusterService
        .deregisterCluster(cluster.id)
        .then(function () {
          Notification.success($translate.instant('hercules.renameAndDeregisterComponent.deregisterConfirmPopup', {
            clusterName: vm.clustername,
          }));
          $modalInstance.close();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          vm.loading = false;
        });
    };
  }

}());
