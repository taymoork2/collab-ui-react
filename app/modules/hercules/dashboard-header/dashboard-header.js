(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('DashboardHeaderController', [
      '$scope',
      'ServiceDescriptor',
      'DashboardAggregator',
      function ($scope, descriptor, aggregator) {
        var services = null;
        var clusters = null;

        var updateServiceAggregates = function () {
          if (services && clusters) {
            $scope.serviceAggregates = aggregator.aggregateServices(services, clusters);
          }
        };

        descriptor.services(function (error, _services) {
          services = _services;
          updateServiceAggregates();
        });

        $scope.$watch('clusters', function (_clusters) {
          clusters = _clusters;
          updateServiceAggregates();
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
