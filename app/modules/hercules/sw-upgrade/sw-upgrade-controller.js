(function () {
  'use strict';

  /* @ngInject */
  function SWUpgradeController($scope, ConnectorService, XhrNotificationService) {
    $scope.saving = false;
    $scope.upgradeSoftware = function () {
      $scope.saving = true;
      ConnectorService
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

  angular
    .module('Hercules')
    .controller('SWUpgradeController', SWUpgradeController);

}());
