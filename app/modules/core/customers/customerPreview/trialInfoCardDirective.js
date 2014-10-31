'use strict';

angular.module('Core')

.directive('trialInfoCard', [

  function() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/core/customers/customerPreview/trialInfoCard.tpl.html',
      link: function(scope, element, attrs) {

      }
    };
  }
])

;
