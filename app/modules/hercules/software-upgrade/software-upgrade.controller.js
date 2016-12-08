(function () {
  'use strict';

  var URL = require('url');

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
    vm.releaseNotesUrl = '';

    FusionClusterService.getReleaseNotes(cluster.releaseChannel, connectorType)
      .then(function (res) {
        vm.releaseNotes = res;
        try {
          var urlParts = URL.parse(res);
          if (urlParts.hostname != undefined && urlParts.hostname != null) {
            vm.releaseNotesUrl = urlParts.href;
          }
        } catch (e) {
          // If not URL, fallback to showing the text (backwards compatible)
        }
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
