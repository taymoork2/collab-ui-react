'use strict';

//Setting it to false just for this file because it does not recognize jQuery's '$' symbol.
/* global $ */

angular.module('Huron')
  .directive('telephonyInfo', function() {
    return {
      restrict: 'A',
      scope:{
        mainPhone: '=',
        sharedPhone: '='
      },
      templateUrl: 'modules/huron/scripts/directives/views/telephony-info.html',
      link: function(scope, elem, attrs){

        scope.mainPhoneData = 'testing1';
        scope.sharedPhoneData = 'testing2';

      }
    };
  });