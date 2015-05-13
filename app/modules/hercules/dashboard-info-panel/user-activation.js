(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('UserActivationController',

      /* @ngInject */
      function ($scope, $state, ServiceDescriptor, USSService, XhrNotificationService, $modal) {
        ServiceDescriptor.services(function (error, services) {
          if (error) {
            XhrNotificationService.notify("Failed to fetch service status", error);
            return;
          }

          USSService.getStatusesSummary(function (error, summary) {
            if (error) {
              XhrNotificationService.notify("Failed to fetch user status summary", error);
              return;
            }

            $scope.xsummary = _.map(services, function (service) {
              var summaryForService = _.find(summary.summary, function (summary) {
                return service.service_id == summary.serviceId;
              });
              var errors = 0;
              var needsUserActivation = !summaryForService || (summaryForService.activated === 0 && summaryForService.error === 0 && summaryForService.notActivated === 0);
              if (needsUserActivation) {
                $scope.showInfoPanel = true;
                $scope.userActivationNotComplete = true;
              }
              if (summaryForService.error > 0) {
                $scope.showInfoPanel = true;
                $scope.servicesWithUserErrors = true;
                errors = summaryForService.error;
              }
              return {
                serviceId: service.service_id,
                needsUserActivation: needsUserActivation,
                errors: errors
              };
            });

          });
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
