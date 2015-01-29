'use strict';

angular.module('Squared')
  .directive('crReloadData', function () {
    return {
      restrict: 'E',
      scope: {
        lastUpdatedTime: '=',
      },
      templateUrl: 'modules/core/scripts/directives/views/reload-data.html',
      link: function (scope, elem, attrs) {

        scope.currentTime = scope.lastUpdatedTime;

        scope.$watch('lastUpdatedTime', function (newVal, oldVal) {
          if (newVal) {
            scope.currentTime = newVal;
          }
        });

      }
    };
  });
