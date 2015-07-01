(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ConfigureConnectorsController', function ($scope) {
      $scope.$watch('clusters', function () {
        if ($scope.clusters && $scope.clusters.length > 0) {
          $scope.clustersWithoutServiceConnectorsEnabled = $scope.clusters.some(function (cluster) {
            return !cluster.any_service_connectors_enabled && cluster.cluster_type === 'c_mgmt';
          });
          $scope.clustersWithNotConfiguredConnectors = $scope.clusters.some(function (cluster) {
            return cluster.any_service_connectors_not_configured && cluster.cluster_type === 'c_mgmt';
          });
        } else {
          $scope.clustersWithoutServiceConnectorsEnabled = false;
          $scope.clustersWithNotConfiguredConnectors = false;
        }
      });
    })
    .directive('herculesConfigureConnectors', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'ConfigureConnectorsController',
          templateUrl: 'modules/hercules/dashboard-info-panel/configure_connectors.html'
        };
      }
    ]);
})();
