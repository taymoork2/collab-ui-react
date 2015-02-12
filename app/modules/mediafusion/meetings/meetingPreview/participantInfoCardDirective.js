'use strict';

angular.module('Mediafusion')

.directive('crPartInfoCard', [

  function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/meetings/meetingPreview/participantInfoCard.tpl.html',
      link: function (scope, element, attrs) {

      }
    };
  }
])

;
