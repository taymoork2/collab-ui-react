'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaBuilderScheduleInfo', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '=',
        },
        templateUrl: 'modules/huron/callRouting/autoAttendant/builder/aaBuilderScheduleInfo.tpl.html',
      };
    }
  ]);
