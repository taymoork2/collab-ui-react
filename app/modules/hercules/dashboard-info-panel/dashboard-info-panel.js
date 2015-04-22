(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('DashboardInfoPanelController', ['$scope', function ($scope) {}])
    .directive('herculesDashboardInfoPanel', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'DashboardInfoPanelController',
          templateUrl: 'modules/hercules/dashboard-info-panel/dashboard-info-panel.html'
        };
      }
    ]);
})();
