(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('UserActivationController',

      /* @ngInject */
      function ($scope, ServiceDescriptor, USSService, XhrNotificationService) {
        ServiceDescriptor.services(function (error, services) {
          if (error) {
            XhrNotificationService.notify("Failed to fetch service status", error);
            return;
          }

          var nameMap = _.reduce(services.fusion_services, function (map, service) {
            map[service.service_id] = service.display_name;
            return map;
          }, {});

          USSService.getStatusesSummary(function (error, summary) {
            if (error) {
              XhrNotificationService.notify("Failed to fetch user status summary", error);
              return;
            }

            $scope.xsummary = _.map(summary.summary, function (service) {
              if (service.activated === 0 || service.error !== 0) {
                $scope.showInfoPanel = true;
                $scope.userActivationNotComplete = true;
              }
              service.display_name = nameMap[service.serviceId] || service.serviceId;
              return service;
            });
          });
        });
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
