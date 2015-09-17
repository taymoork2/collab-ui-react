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
        templateUrl: 'modules/huron/callRouting/autoAttendant/builder/aaBuilderScheduleInfo.tpl.html'
      };
    }
  ]);
