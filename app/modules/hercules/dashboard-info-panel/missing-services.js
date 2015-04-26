(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('MissingServicesController',

      /* @ngInject */
      function ($scope, ServiceDescriptor, XhrNotificationService) {
        ServiceDescriptor.services(function (error, services) {
          $scope.services = services || {};
          $scope.servicesMissing = _.find(services.fusion_services, function (service) {
            return service.status == 'error';
          });
          if (error) XhrNotificationService.notify("Failed to fetch service status", error);
          if ($scope.servicesMissing) $scope.showInfoPanel = true;
        });
      }

    )
    .directive('herculesMissingServices', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'MissingServicesController',
          templateUrl: 'modules/hercules/dashboard-info-panel/missing-services.html'
        };
      }
    ]);
})();
