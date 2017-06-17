(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('dynamicExample', DynamicExample);

  function DynamicExample() {
    return {
      restrict: 'E',
      template: '<span contentEditable="false" style="background-color:aqua; padding-left:2px; padding-right:2px; height:1rem; color:grey;" ng-click="clicker();">link</span>',
      scope: {
        value: '=',
      },
      transclude: true,
      controller: function ($scope) {
        $scope.clicker = function () {
          if ($scope.value);
        };
      },
    };
  }
})();
