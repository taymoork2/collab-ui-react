(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaCallerInput', aaCallerInput);

  function aaCallerInput() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
      },
      controller: 'AACallerInputCtrl',
      controllerAs: 'aaCallerInput',
      templateUrl: 'modules/huron/features/autoAttendant/callerInput/aaCallerInput.tpl.html'
    };
  }
})();
