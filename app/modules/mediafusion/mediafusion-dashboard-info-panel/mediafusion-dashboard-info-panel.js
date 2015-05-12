'use strict';

(
  function () {

    angular.module('Mediafusion')
      .controller('MediaFusionDashboardInfoPanelController', function ($scope) {

      })
      .directive('mediafusionDashboardInfoPanel', [
        function () {
          return {
            restrict: 'E',
            scope: false,
            controller: 'MediaFusionDashboardInfoPanelController',
            templateUrl: 'modules/mediafusion/mediafusion-dashboard-info-panel/mediafusion-dashboard-info-panel.html'

          };
        }
      ]);
  }
)();
