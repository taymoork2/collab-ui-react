'use strict';

angular.module('Squared')
  .directive('crReloadData', crReloadData);

function crReloadData() {
  return {
    restrict: 'E',
    scope: {
      lastUpdatedTime: '=',
    },
    templateUrl: 'modules/core/scripts/directives/views/reload-data.html',
    link: function (scope) {
      scope.currentTime = scope.lastUpdatedTime;
      scope.$watch('lastUpdatedTime', function (newVal, oldVal) {
        if (newVal) {
          scope.currentTime = newVal;
          var date = moment(scope.currentTime);
          scope.currentTime = date.fromNow();
        }
      });
    }
  };
}
