'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaRouteToExtNum', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@aaSchedule',
          index: '=aaIndex',
          keyIndex: '@aaKeyIndex'
        },
        controller: 'AARouteToExtNumCtrl',
        controllerAs: 'aaRouteToExtNum',
        templateUrl: 'modules/huron/features/autoAttendant/routeToExtNum/aaRouteToExtNum.tpl.html'
      };
    }
  ]);
