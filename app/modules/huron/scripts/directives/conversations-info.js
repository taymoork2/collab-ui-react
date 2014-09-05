'use strict';

//Setting it to false just for this file because it does not recognize jQuery's '$' symbol.
/* global $ */

angular.module('Huron')
  .directive('conversationsInfo', function() {
    return {
      restrict: 'A',
      scope:{
        userEmail: '=',
      },
      templateUrl: 'modules/huron/scripts/directives/views/conversations-info.html',
      link: function(scope, elem, attrs){

      }
    };
  });