(function () {
  'use strict';
  angular
    .module('Hercules')
    .directive('herculesNothingFused', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          templateUrl: 'modules/hercules/dashboard/nothing-fused.html'
        };
      }
    ]);
})();
