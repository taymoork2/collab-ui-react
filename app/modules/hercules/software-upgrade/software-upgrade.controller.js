(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('SoftwareUpgradeController', SoftwareUpgradeController);

  /* @ngInject */
  function SoftwareUpgradeController($translate, $modalInstance, servicesId, connectorType, softwareUpgrade, cluster, ClusterService, XhrNotificationService) {
    var vm = this;
    vm.upgrading = false;
    vm.availableVersion = softwareUpgrade.availableVersion;
    vm.serviceName = $translate.instant('hercules.serviceNames.' + servicesId[0]);
    vm.clusterName = cluster.name;
    vm.connectorName = $translate.instant('hercules.connectorNames.' + servicesId[0]);
    vm.releaseNotes = '';

    ClusterService.getReleaseNotes('GA', connectorType)
      .then(function (res) {
        vm.releaseNotes = res;
      });

    vm.upgrade = function () {
      vm.upgrading = true;
      ClusterService
        .upgradeSoftware(cluster.id, connectorType)
        .then(function () {
          $modalInstance.close();
        }, XhrNotificationService.notify)
        .finally(function () {
          vm.upgrading = false;
        });
    };
  }
}());
