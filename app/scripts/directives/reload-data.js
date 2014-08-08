'use strict';

//Setting it to false just for this file because it does not recognize jQuery's '$' symbol.
/* global $ */

angular.module('wx2AdminWebClientApp')
  .directive('reloadData', function() {
    return {
    restrict: 'E',
    scope:{
      lastUpdatedTime: "=",
    },
    templateUrl: '/views/reload-data.html',
    link: function(scope, elem, attrs){

      scope.currentTime = scope.lastUpdatedTime;

      scope.$watch('lastUpdatedTime', function(newVal, oldVal){
            if(newVal)
          {
            scope.currentTime = newVal; 
          }
      });

    }
    };
  });