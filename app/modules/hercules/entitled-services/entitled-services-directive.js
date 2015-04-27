(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('EntitledServicesController',

      /* @ngInject */
      function ($scope, ServiceDescriptor, XhrNotificationService) {
        ServiceDescriptor.services(function (error, services) {
          $scope.services = services || [];
          if (error) {
            XhrNotificationService.notify("Failed to fetch service status", error);
          }
        });
      }

    )
    .directive('herculesEntitledServices', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          controller: 'EntitledServicesController',
          templateUrl: 'modules/hercules/entitled-services/entitled-services.html'
        };
      }
    ]);
})();
