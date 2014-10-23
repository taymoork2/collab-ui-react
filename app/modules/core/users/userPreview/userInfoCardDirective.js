'use strict';

angular.module('Core')

.directive('userInfoCard', [

  function() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/core/users/userPreview/userInfoCard.tpl.html',
      link: function(scope, element, attrs) {

      }
    };
  }
])

;
