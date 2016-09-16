(function () {
  'use strict';

  /* @ngInject */
  function UpgradeNowControllerV2(MediaClusterServiceV2, Notification, $modalInstance, clusterId, XhrNotificationService, $translate) {
    var vm = this;
    //clusterId, connector, MediaClusterServiceV2, XhrNotificationService, $translate, $modalInstance, Notification

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
            //clusterName: cluster.name,
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
    .controller('UpgradeNowControllerV2', UpgradeNowControllerV2);

}());
