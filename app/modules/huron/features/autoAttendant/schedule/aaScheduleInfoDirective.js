(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaScheduleInfo', aaScheduleInfo);

  function aaScheduleInfo() {
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
})();
