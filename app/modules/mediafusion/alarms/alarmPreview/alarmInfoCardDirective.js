'use strict';

angular.module('Mediafusion')

.directive('crAlarmInfoCard', [

  function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/alarms/alarmPreview/alarmInfoCard.tpl.html',
      link: function (scope, element, attrs) {

      }
    };
  }
])

;
