'use strict';

angular
  .module('Hercules').controller('SWUpgradeController', ['$scope', 'ConnectorService', 'XhrNotificationService',
    function ($scope, connectorService, notification) {
      $scope.saving = false;
      $scope.upgradeSoftware = function () {
        connectorService.upgradeSoftware($scope.cluster.id, $scope.upgradePackage.service.service_type, function (err) {
          $scope.saving = true;
          if (err) {
            $scope.error = 'Unable to initiate software upgrade: ' + notification.getMessages(err).join(', ');
            $scope.saving = false;
          } else {
            $scope.upgradeModal.close();
            $scope.saving = false;
          }
        }, {
          squelchErrors: true
        });
        return false;
      };
    }
  ]);
