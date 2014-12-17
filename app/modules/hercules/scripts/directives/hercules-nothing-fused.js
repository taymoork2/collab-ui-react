(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('NothingFusedController', ['$scope', function ($scope) {
      $scope.services = {
        'UCM Service': [
          'Zero touch meetings, move calls between desk phones and soft clients.',
          'Reuse your enterprise phone number.'
        ],
        'Calendar Service': [
          'Calendar sync for consistent meeting times.',
          'In-app scheduling connected to Microsoft Exchange.'
        ]
      };
    }])
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
