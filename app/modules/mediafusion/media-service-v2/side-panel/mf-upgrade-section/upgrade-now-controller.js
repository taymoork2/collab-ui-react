(function () {
  'use strict';

  /* @ngInject */
  function UpgradeNowControllerV2(MediaClusterServiceV2, Notification, $modalInstance, clusterId, $translate) {
    var vm = this;
    //clusterId, connector, MediaClusterServiceV2, $translate, $modalInstance, Notification

    vm.upgrade = function () {
      vm.saving = true;
      MediaClusterServiceV2
        .upgradeCluster(clusterId)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
          Notification.success('mediaFusion.upgradeClusters.success');
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.upgradeClusters.error', {
            //clusterName: cluster.name
          });
          Notification.errorWithTrackingId(err, vm.error);
          vm.saving = false;
        });
      return false;
    };

    vm.close = $modalInstance.close;

  }
  angular
    .module('Mediafusion')
    .controller('UpgradeNowControllerV2', UpgradeNowControllerV2);

}());
