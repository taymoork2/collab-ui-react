(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('EntitledServicesController', ['$scope', 'ServiceDescriptor', 'XhrNotificationService', function ($scope, service, notification) {
      service.services(function (error, services) {
        $scope.services = services;
        if (error) {
          notification.notify("Failed to fetch service status", error);
        }
      });
    }])
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
