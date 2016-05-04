(function () {
  'use strict';

  (function () {

    angular.module('Mediafusion')
      .controller('MediaFusionDashboardInfoPanelController', MediaFusionDashboardInfoPanelController)
      .directive('mediafusionDashboardInfoPanel', mediafusionDashboardInfoPanel);

    function MediaFusionDashboardInfoPanelController() {}

    function mediafusionDashboardInfoPanel() {
      return {
        restrict: 'E',
        scope: false,
        controller: 'MediaFusionDashboardInfoPanelController',
        templateUrl: 'modules/mediafusion/mediafusion-dashboard-info-panel/mediafusion-dashboard-info-panel.html'
      };
    }
  })();
})();
