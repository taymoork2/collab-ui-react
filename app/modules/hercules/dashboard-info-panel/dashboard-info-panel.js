(function () {
  'use strict';
  angular
    .module('Hercules')
    .directive('herculesDashboardInfoPanel', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          templateUrl: 'modules/hercules/dashboard-info-panel/dashboard-info-panel.html'
        };
      }
    ]);
})();
