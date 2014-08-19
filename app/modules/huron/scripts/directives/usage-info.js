'use strict';

//Setting it to false just for this file because it does not recognize jQuery's '$' symbol.
/* global $ */

angular.module('Huron')
  .directive('usageInfo', function() {
    return {
    restrict: 'E',
    scope:{
      userEmail: "=",
    },
    templateUrl: 'modules/huron/scripts/directives/views/usage-info.html',
    link: function(scope, elem, attrs){

    }
    };
  });