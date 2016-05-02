(function () {
  'use strict';

  (function () {
    angular.module('Mediafusion')
      .controller('MediaFusionAdditionalConfigurationController', MediaFusionAdditionalConfigurationController)
      .directive('mediafusionAdditionalConfiguration', mediafusionAdditionalConfiguration);

    function MediaFusionAdditionalConfigurationController() {}

    function mediafusionAdditionalConfiguration() {
      return {
        restrict: 'E',
        scope: false,
        controller: 'MediaFusionAdditionalConfigurationController',
        templateUrl: 'modules/mediafusion/mediafusion-dashboard-info-panel/mediafusion-additional-configuration.html'
      };
    }
  })();
})();
