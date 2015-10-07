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
          services = ServiceDescriptor.filterEnabledServices(_services.allExceptManagement);
          $scope.noServicesEnabled = !services || services.length === 0;
          updateServiceAggregates();
        });

        $scope.$watch('clusters', function (_clusters) {
          clusters = _clusters;
          updateServiceAggregates();
        });

        $scope.serviceIcon = function (serviceId) {
          return ServiceDescriptor.serviceIcon(serviceId);
        };

        $scope.openUserStatusReportModal = function (serviceId) {
          $scope.selectedServiceId = serviceId;
          $scope.modal = $modal.open({
            scope: $scope,
            controller: 'ExportUserStatusesController',
            templateUrl: 'modules/hercules/export/export-user-statuses.html'
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
