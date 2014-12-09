(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('singleNumberReachInfo', [
      function () {
        return {
          controller: 'SingleNumberReachInfoCtrl',
          restrict: 'EA',
          scope: false,
          templateUrl: 'modules/huron/snr/snr.tpl.html'
        };
      }
    ]);
})();
