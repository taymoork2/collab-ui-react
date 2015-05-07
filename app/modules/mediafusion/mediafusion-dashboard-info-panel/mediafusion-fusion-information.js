'use strict';

(
  function () {
    angular.module('Mediafusion')
      .controller('MediaFusionInformationController', function () {

      })
      .directive('mediafusionFusionInformation', [
        function () {
          return {
            restrict: 'E',
            scope: false,
            controller: 'MediaFusionInformationController',
            templateUrl: 'modules/mediafusion/mediafusion-dashboard-info-panel/mediafusion-fusion-information.html'
          };
        }
      ]);
  })();
