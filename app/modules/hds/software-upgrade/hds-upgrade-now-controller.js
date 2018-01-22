(function () {
  'use strict';

  /* @ngInject */
  function HDSUpgradeNowController(HybridServicesClusterService, Notification, $modalInstance, clusterId, $translate) {
    var vm = this;

    vm.upgrade = function () {
      HybridServicesClusterService
        .upgradeSoftware(clusterId, 'hds_app')
        .then(function () {
          $modalInstance.dismiss();
          Notification.success('mediaFusion.upgradeClusters.success');
        }, function (err) {
          var error = $translate.instant('mediaFusion.upgradeClusters.error', {
            //clusterName: cluster.name
          });
          Notification.errorWithTrackingId(err, error);
        });
      return false;
    };
  }
  angular
    .module('HDS')
    .controller('HDSUpgradeNowController', HDSUpgradeNowController);
}());
