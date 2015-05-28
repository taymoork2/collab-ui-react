(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('DashboardHeaderController',

      /* @ngInject */
      function ($scope, ServiceDescriptor, DashboardAggregator, USSService) {
        var services = null;
        var clusters = null;

        USSService.getStatusesSummary(function (err, userStatusesSummary) {
          $scope.userStatusesSummary = userStatusesSummary || {};
          $scope.summary = function (serviceId) {
            var summary = null;
            if ($scope.userStatusesSummary) {
              summary = _.find($scope.userStatusesSummary.summary, function (s) {
                return s.serviceId == serviceId;
              });
            }
            return summary || {
              activated: 0,
              notActivated: 0
            };
          };
        });

        var updateServiceAggregates = function () {
          if (services && clusters) {
            $scope.serviceAggregates = DashboardAggregator.aggregateServices(services, clusters);
          }
        };

        $scope.$watch('services', function (_services) {
          services = _services.enabledOnly;
          updateServiceAggregates();
        });

        $scope.$watch('clusters', function (_clusters) {
          clusters = _clusters;
          updateServiceAggregates();
        });
      }
    )
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
