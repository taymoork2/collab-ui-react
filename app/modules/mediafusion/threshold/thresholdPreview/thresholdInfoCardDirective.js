'use strict';

angular.module('Mediafusion')

.directive('crThresholdInfoCard', [

  function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/threshold/thresholdPreview/thresholdInfoCard.tpl.html',
      link: function (scope, element, attrs) {

      }
    };
  }
])

;
