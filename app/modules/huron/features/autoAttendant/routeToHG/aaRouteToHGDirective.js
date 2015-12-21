'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaRouteToHg', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@aaSchedule',
          index: '=aaIndex',
          keyIndex: '@aaKeyIndex'
        },
        controller: 'AARouteToHGCtrl',
        controllerAs: 'aaRouteToHG',
        templateUrl: 'modules/huron/features/autoAttendant/routeToHG/aaRouteToHG.tpl.html'
      };
    }
  ]);
