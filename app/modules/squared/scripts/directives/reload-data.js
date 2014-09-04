'use strict';

angular.module('Squared')
  .directive('reloadData', function() {
    return {
      restrict: 'E',
      scope:{
        lastUpdatedTime: '=',
      },
      templateUrl: 'modules/squared/scripts/directives/views/reload-data.html',
      link: function(scope, elem, attrs){

        scope.currentTime = scope.lastUpdatedTime;

        scope.$watch('lastUpdatedTime', function(newVal, oldVal){
          if(newVal) {
            scope.currentTime = newVal;
          }
        });

      }
    };
  });