'use strict';

angular.module('Mediafusion')

.directive('crEntResInfoCard', [

  function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/enterpriseResource/enterpriseResourcePreview/enterpriseResourceInfoCard.tpl.html',
      link: function (scope, element, attrs) {

      }
    };
  }
])

;
