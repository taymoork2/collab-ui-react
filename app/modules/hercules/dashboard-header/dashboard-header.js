(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('DashboardHeaderController', [
      '$scope',
      'ServiceDescriptor',
      'DashboardAggregator',
      'USSService',
      function ($scope, descriptor, aggregator, ussService) {
        var services = null;
        var clusters = null;

        ussService.getStatusesSummary(function (err, userStatusesSummary) {
          $scope.userStatusesSummary = userStatusesSummary || {};
          $scope.summary = function (serviceId) {
            var summary = null;
            if ($scope.userStatusesSummary) {
              summary = _.find($scope.userStatusesSummary.summary, function (s) {
                return s.serviceId == serviceId;
              });
            }
            return summary || { activated: 0, notActivated: 0 };
          };
        });

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
