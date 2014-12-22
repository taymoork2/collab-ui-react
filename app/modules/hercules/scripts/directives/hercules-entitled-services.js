(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('EntitledServicesController', ['$scope', 'ConnectorService', function ($scope, service) {
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
          templateUrl: 'modules/hercules/views/hercules-entitled-services.html'
        };
      }
    ]);
})();
