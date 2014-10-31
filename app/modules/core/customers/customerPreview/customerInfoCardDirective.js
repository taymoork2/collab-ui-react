'use strict';

angular.module('Core')

.directive('customerInfoCard', [

  function() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/core/customers/customerPreview/customerInfoCard.tpl.html',
      link: function(scope, element, attrs) {

      }
    };
  }
])

;
