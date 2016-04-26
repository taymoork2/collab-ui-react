(function () {
  'use strict';

  angular.module('Mediafusion')
    .directive('crAlarmInfoCard', crAlarmInfoCard);

  function crAlarmInfoCard() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/alarms/alarmPreview/alarmInfoCard.tpl.html',
      link: function (scope, element, attrs) {

      }
    };
  }
})();
