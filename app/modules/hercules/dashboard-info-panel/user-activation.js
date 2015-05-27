(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('UserActivationController',

      /* @ngInject */
      function ($scope, $state, ServiceDescriptor, USSService, XhrNotificationService, $modal, ClusterProxy) {
        $scope.statusSummary = [];
        var updateSummary = function () {
          if (!$scope.clusters || $scope.clusters.length === 0 || !$scope.services.enabledOnly || $scope.services.enabledOnly.length === 0) {
            $scope.userActivationNotComplete = false;
            $scope.servicesWithUserErrors = false;
            return;
          }
          $scope.xsummary = _.map($scope.services.enabledOnly, function (service) {
            var summaryForService = _.find($scope.statusSummary, function (summary) {
              return service.service_id == summary.serviceId;
            });
            var errors = 0;
            var needsUserActivation = !summaryForService || (summaryForService.activated === 0 && summaryForService.error === 0 && summaryForService.notActivated === 0);
            if (needsUserActivation) {
              $scope.showInfoPanel = true;
              $scope.userActivationNotComplete = true;
            } else {
              $scope.userActivationNotComplete = false;
            }
            if (summaryForService && summaryForService.error > 0) {
              $scope.showInfoPanel = true;
              $scope.servicesWithUserErrors = true;
              errors = summaryForService.error;
            } else {
              $scope.servicesWithUserErrors = false;
            }
            return {
              serviceId: service.service_id,
              needsUserActivation: needsUserActivation,
              errors: errors
            };
          });
        };

        $scope.$watch('services', function () {
          updateSummary();
        });

        $scope.$watch('clusters', function () {
          updateSummary();
        });

        USSService.getStatusesSummary(function (error, summary) {
          if (error) {
            XhrNotificationService.notify("Failed to fetch user status summary", error);
            return;
          }
          $scope.statusSummary = summary.summary;
          updateSummary();
        });

        $scope.navigateToUsers = function () {
          $state.go('users.list');
        };

        $scope.showUserStatusesDialog = function (selectedServiceId) {
          $scope.selectedServiceId = selectedServiceId;
          $scope.modal = $modal.open({
            scope: $scope,
            controller: 'UserStatusesController',
            templateUrl: 'modules/hercules/dashboard-info-panel/user-errors.html'
          });
        };

      }
    )
    .directive('herculesUserActivation', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'UserActivationController',
          templateUrl: 'modules/hercules/dashboard-info-panel/user-activation.html'
        };
      }

    ]);
})();
