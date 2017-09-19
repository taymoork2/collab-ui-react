(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaRouteToAa', aaRouteToAa);

  function aaRouteToAa() {
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
      controller: 'AARouteToAACtrl',
      controllerAs: 'aaRouteToAA',
      template: require('modules/huron/features/autoAttendant/routeToAA/aaRouteToAA.tpl.html'),
    };
  }
})();
