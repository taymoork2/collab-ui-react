(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('NothingFusedController', ['$scope', 'ConnectorService', function ($scope, service) {}])
    .directive('herculesNothingFused', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          controller: 'NothingFusedController',
          templateUrl: 'modules/hercules/views/hercules-nothing-fused.html'
        };
      }
    ]);
})();
