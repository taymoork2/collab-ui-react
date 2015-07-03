(function () {
  'use strict';

  /* @ngInject */
  function ServiceDetailsController($scope, $modal, $stateParams, ConnectorService) {
    $scope.cluster = ConnectorService.getClusters()[$stateParams.clusterId];

    $scope.$watch(
      function () {
        return _.find($scope.cluster.services, function (s) {
          return s.service_type == $stateParams.serviceType;
        });
      },
      function (newVal, oldVal) {
        $scope.service = newVal;
      }
    );

    $scope.showUpgradeDialog = function (upgradePackage, cluster, currentVersion) {
      // todo: why are these needed on the scope?
      $scope.upgradePackage = upgradePackage;
      $scope.currentVersion = currentVersion;
      $scope.upgradeModal = $modal.open({
        scope: $scope,
        controller: 'SWUpgradeController',
        templateUrl: 'modules/hercules/sw-upgrade/upgrade-dialog.html'
      });
    };
  }

  angular
    .module('Hercules')
    .controller('ServiceDetailsController', ServiceDetailsController);

}());
