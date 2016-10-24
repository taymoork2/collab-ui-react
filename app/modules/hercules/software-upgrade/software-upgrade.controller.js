(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('SoftwareUpgradeController', SoftwareUpgradeController);

  /* @ngInject */
  function SoftwareUpgradeController($translate, $modalInstance, servicesId, connectorType, availableVersion, cluster, ClusterService, FusionClusterService, Notification) {
    var vm = this;
    vm.upgrading = false;
    vm.availableVersion = availableVersion;
    vm.serviceName = $translate.instant('hercules.serviceNames.' + servicesId[0]);
    vm.clusterName = cluster.name;
    vm.connectorName = $translate.instant('hercules.connectorNames.' + servicesId[0]);
    vm.releaseNotes = '';

    FusionClusterService.getReleaseNotes(cluster.releaseChannel, connectorType)
      .then(function (res) {
        vm.releaseNotes = res;
      }, function () {
        vm.releaseNotes = 'Not Found';
      });

    vm.upgrade = function () {
      vm.upgrading = true;
      ClusterService
        .upgradeSoftware(cluster.id, connectorType)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(function () {
          vm.upgrading = false;
        });
    };
  }
}());
