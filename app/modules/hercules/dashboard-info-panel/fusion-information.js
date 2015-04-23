(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('FusionInformationController', [
      function () {}
    ])
    .directive('herculesFusionInformation', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'FusionInformationController',
          templateUrl: 'modules/hercules/dashboard-info-panel/fusion-information.html'
        };
      }
    ]);
})();
