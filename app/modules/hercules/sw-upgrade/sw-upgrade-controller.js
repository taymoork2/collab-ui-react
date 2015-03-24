'use strict';

angular
  .module('Hercules').controller('SWUpgradeController', [
    '$scope', 'ConnectorService',
    function ($scope, connectorService) {
      $scope.saving = false;
      $scope.upgradeSoftware = function () {
        connectorService.upgradeSoftware($scope.cluster.id, $scope.upgradePackage.service.service_type, function (err) {
          $scope.saving = true;
          if (err) {
            $scope.error = "Unable to upgrade";
            $scope.saving = false;
          } else {
            $scope.saving = false;
            $scope.upgradeModal.close();
          }
        });
        return false;
      };
    }
  ]);
