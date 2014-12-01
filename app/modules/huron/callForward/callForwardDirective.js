(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('hnCallForward', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          templateUrl: 'modules/huron/callForward/callForward.tpl.html'
        };
      }
    ]);
})();
