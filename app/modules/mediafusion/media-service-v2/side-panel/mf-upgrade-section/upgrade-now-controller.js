(function () {
  'use strict';

  /* @ngInject */
  function UpgradeNowControllerV2(ClusterService, Notification, $modalInstance, clusterId, $translate) {
    var vm = this;
    //clusterId, connector, ClusterService, $translate, $modalInstance, Notification

    vm.upgrade = function () {
      vm.saving = true;
      ClusterService
        .upgradeSoftware(clusterId, 'mf_mgmt')
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
