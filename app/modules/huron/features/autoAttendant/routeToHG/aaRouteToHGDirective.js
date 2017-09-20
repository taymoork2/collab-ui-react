(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaRouteToHg', aaRouteToHg);

  function aaRouteToHg() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
        fromRouteCall: '@aaFromRouteCall',
        fromDecision: '@aaFromDecision',
        fromFallback: '@aaFromFallback',
      },
      controller: 'AARouteToHGCtrl',
      controllerAs: 'aaRouteToHG',
      template: require('modules/huron/features/autoAttendant/routeToHG/aaRouteToHG.tpl.html'),
    };
  }
})();
