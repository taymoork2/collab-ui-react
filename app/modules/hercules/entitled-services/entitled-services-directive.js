(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('EntitledServicesController', function ($scope) {})
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
