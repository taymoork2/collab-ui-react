(function () {
  'use strict';
  angular
    .module('Hercules')
    .directive('herculesSoftwareUpgrade', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          templateUrl: 'modules/hercules/dashboard/software-upgrade.html'
        };
      }
    ]);
})();
