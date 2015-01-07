(function () {
  'use strict';
  angular
    .module('Hercules')
    .directive('herculesNothingFused', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          templateUrl: 'modules/hercules/views/hercules-nothing-fused.html'
        };
      }
    ]);
})();
