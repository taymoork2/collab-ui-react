'use strict';

angular.module('Core')

.directive('userServicesCard', [

  function() {
    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      templateUrl: 'modules/core/users/userPreview/userServicesCard.tpl.html',
      link: function(scope, element, attrs) {

      }
    };
  }
])

;
