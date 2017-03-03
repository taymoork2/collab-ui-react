(function () {
  'use strict';

  /* @ngInject */
  function HDSUpgradeNowController(HDSService, Notification, $modalInstance, clusterId, $translate) {
    var vm = this;
    //clusterId, connector, MediaClusterServiceV2, $translate, $modalInstance, Notification

    vm.upgrade = function () {
      vm.saving = true;
      HDSService
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
    .module('HDS')
    .controller('HDSUpgradeNowController', HDSUpgradeNowController);

}());
