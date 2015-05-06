(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('UserActivationController',

      /* @ngInject */
      function ($scope, $state, ServiceDescriptor, USSService, XhrNotificationService) {
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
              if (summaryForService.activated === 0 || summaryForService.error !== 0) {
                $scope.showInfoPanel = true;
                $scope.userActivationNotComplete = true;
              }
              return {
                display_name: service.display_name,
                error: summaryForService.error,
                activated: summaryForService.activated
              };
            });

          });
        });

        $scope.navigateToUsers = function () {
          $state.go('users.list');
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
