'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaScheduleInfo', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@',
        },
        controller: 'AAScheduleInfoCtrl',
        controllerAs: 'scheduleInfo',
        bindToController: true,
        templateUrl: 'modules/huron/features/autoAttendant/schedule/aaScheduleInfo.tpl.html'
      };
    }
  ]);
