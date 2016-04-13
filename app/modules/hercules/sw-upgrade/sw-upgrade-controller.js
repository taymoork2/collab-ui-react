(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('SWUpgradeController', SWUpgradeController);

  /* @ngInject */
  function SWUpgradeController($scope, ClusterService, XhrNotificationService) {
    $scope.saving = false;
    $scope.upgradeSoftware = function () {
      $scope.saving = true;
      ClusterService
        .upgradeSoftware($scope.cluster.id, $scope.upgradePackage.service.service_type)
        .then(function () {
          $scope.upgradeModal.close();
          $scope.saving = false;
        }, function (err) {
          $scope.error = 'Unable to initiate software upgrade: ' + XhrNotificationService.getMessages(err).join(', ');
          $scope.saving = false;
        });
      return false;
    };
  }

}());
