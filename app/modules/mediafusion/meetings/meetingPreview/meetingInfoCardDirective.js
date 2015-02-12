'use strict';

angular.module('Mediafusion')

.directive('crMetInfoCard', [

  function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/meetings/meetingPreview/meetingInfoCard.tpl.html',
      link: function (scope, element, attrs) {

      }
    };
  }
])

;
