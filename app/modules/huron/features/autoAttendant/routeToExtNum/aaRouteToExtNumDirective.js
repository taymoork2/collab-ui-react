(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaRouteToExtNum', aaRouteToExtNum);

  function aaRouteToExtNum() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
        fromRouteCall: '@aaFromRouteCall'
      },
      controller: 'AARouteToExtNumCtrl',
      controllerAs: 'aaRouteToExtNum',
      templateUrl: 'modules/huron/features/autoAttendant/routeToExtNum/aaRouteToExtNum.tpl.html'
    };
  }
})();
