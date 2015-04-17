'use strict';

angular.module('Squared')
  .directive('crReloadData', function ($log) {
    return {
      restrict: 'E',
      scope: {
        lastUpdatedTime: '=',
      },
      templateUrl: 'modules/core/scripts/directives/views/reload-data.html',
      link: function (scope) {
        $log.log(scope.lastUpdatedTime);
        scope.currentTime = scope.lastUpdatedTime;
        scope.$watch('lastUpdatedTime', function (newVal, oldVal) {
          if (newVal) {
            scope.currentTime = newVal;
          }
        });
      }
    };
  });
