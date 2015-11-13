'use strict';

(function () {
  angular.module('Mediafusion')
    .controller('MediaFusionAdditionalConfigurationController', function () {

    })
    .directive('mediafusionAdditionalConfiguration', [
      function () {
        return {
          restrict: 'E',
          scope: false,
          controller: 'MediaFusionAdditionalConfigurationController',
          templateUrl: 'modules/mediafusion/mediafusion-dashboard-info-panel/mediafusion-additional-configuration.html'
        };
      }
    ]);
})();
