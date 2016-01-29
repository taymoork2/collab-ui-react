'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaRouteToAa', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@aaSchedule',
          index: '=aaIndex',
          keyIndex: '@aaKeyIndex'
        },
        controller: 'AARouteToAACtrl',
        controllerAs: 'aaRouteToAA',
        templateUrl: 'modules/huron/features/autoAttendant/routeToAA/aaRouteToAA.tpl.html'
      };
    }
  ]);
