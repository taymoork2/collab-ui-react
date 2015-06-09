(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('DashboardHeaderController',

      /* @ngInject */
      function ($scope, ServiceDescriptor, DashboardAggregator, USSService, $modal) {
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
                notActivated: 0,
                error: 0
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

        $scope.serviceIcon = function (serviceId) {
          if (!serviceId) {
            return 'icon icon-circle-question';
          }
          switch (serviceId) {
          case 'squared-fusion-cal':
            return 'icon icon-circle-calendar';
          case 'squared-fusion-uc':
            return 'icon icon-circle-call';
          case 'squared-fusion-media':
            return 'icon icon-circle-telepresence';
          case 'contact-center-context':
            return 'icon icon-circle-world';
          default:
            return 'icon icon-circle-question';
          }
        };

        $scope.openUserStatusReportModal = function (serviceId) {
          $scope.selectedServiceId = serviceId;
          $scope.modal = $modal.open({
            scope: $scope,
            controller: 'ExportUserStatusesController',
            templateUrl: 'modules/hercules/dashboard-header/export-user-statuses.html'
          });
        };
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
