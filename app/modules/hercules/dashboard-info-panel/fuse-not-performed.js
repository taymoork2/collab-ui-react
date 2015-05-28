(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('FuseNotPerformedController', function ($scope) {})
    .directive('herculesFuseNotPerformed', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'FuseNotPerformedController',
          templateUrl: 'modules/hercules/dashboard-info-panel/fuse-not-performed.html'
        };
      }
    ]);
})();
