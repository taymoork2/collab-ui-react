(function () {
  'use strict';

  (
    function () {
      angular.module('Mediafusion')
        .controller('MediaFusionInformationController', MediaFusionInformationController)
        .directive('mediafusionFusionInformation', mediafusionFusionInformation);

      function MediaFusionInformationController() {}

      function mediafusionFusionInformation() {
        return {
          restrict: 'E',
          scope: false,
          controller: 'MediaFusionInformationController',
          templateUrl: 'modules/mediafusion/mediafusion-dashboard-info-panel/mediafusion-fusion-information.html'
        };
      }
    })();
})();
