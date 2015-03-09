(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('DashboardHeaderController', [
      '$scope',
      'ServiceDescriptor',
      'DashboardAggregator',
      function ($scope, service, aggregator) {
        service.services(function (services) {
          $scope.services = services;
        });

        $scope.$watch('clusters', function (newClusters) {
          $scope.serviceAggregates = aggregator.aggregateServices($scope.services, newClusters);
        });
      }
    ])
    .directive('herculesDashboardHeader', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          controller: 'DashboardHeaderController',
          templateUrl: 'modules/hercules/dashboard-header/dashboard-header.html'
        };
      }
    ]);
})();
