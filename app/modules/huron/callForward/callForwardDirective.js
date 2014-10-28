'use strict';

angular.module('Huron')

.directive('callForwardInfo', [
  function() {
    return {
      controller: 'callForwardInfoCtrl',
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/callForward/callForward.tpl.html'
    };
  }
]);