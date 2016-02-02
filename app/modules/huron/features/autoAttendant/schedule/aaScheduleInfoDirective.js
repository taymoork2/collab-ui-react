'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaBuilderScheduleInfo', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@',
        },
        controller: 'AABuilderScheduleInfoCtrl',
        controllerAs: 'scheduleInfo',
        bindToController: true,
        templateUrl: 'modules/huron/features/autoAttendant/schedule/aaScheduleInfo.tpl.html'
      };
    }
  ]);
