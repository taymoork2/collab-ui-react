(function () {
  'use strict';
  angular
    .module('Hercules')
    .directive('herculesFusionWelcome', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          templateUrl: 'modules/hercules/dashboard/fusion-welcome.html'
        };
      }
    ]);
})();
