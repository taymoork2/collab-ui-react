(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('DashboardHeaderController', ['$scope', 'ConnectorService', function ($scope, service) {
      service.services(function (services) {
        $scope.services = services;
      });

      $scope.$watch('clusters', function (newClusters, oldClusters) {
        $scope.serviceAggregates = service.aggregateServices($scope.services, newClusters);
      });

    }])
    .directive('herculesDashboardHeader', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          controller: 'DashboardHeaderController',
          templateUrl: 'modules/hercules/views/hercules-dashboard-header.html'
        };
      }
    ]);
})();
