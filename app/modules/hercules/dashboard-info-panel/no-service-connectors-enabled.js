(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('NoServiceConnectorsEnabledController', function ($scope) {
      $scope.$watch('clusters', function () {
        if ($scope.clusters && $scope.clusters.length > 0) {
          $scope.clustersWithoutServiceConnectorsEnabled = $scope.clusters.some(function (cluster) {
            return !cluster.any_service_connectors_enabled;
          });
        } else {
          $scope.clustersWithoutServiceConnectorsEnabled = false;
        }
      });
    })
    .directive('herculesNoServiceConnectorsEnabled', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'NoServiceConnectorsEnabledController',
          templateUrl: 'modules/hercules/dashboard-info-panel/no-service-connectors-enabled.html'
        };
      }
    ]);
})();
