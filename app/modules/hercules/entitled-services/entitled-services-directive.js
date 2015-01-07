(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('EntitledServicesController', ['$scope', 'ServiceDescriptor', function ($scope, service) {
      service.services(function (services) {
        $scope.services = services;
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
