(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('hnCallerId', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          templateUrl: 'modules/huron/callerId/callerId.tpl.html'
        };
      }
    ]);
})();
