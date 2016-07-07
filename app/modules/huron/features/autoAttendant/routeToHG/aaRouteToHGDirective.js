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
        fromRouteCall: '@aaFromRouteCall'
      },
      controller: 'AARouteToHGCtrl',
      controllerAs: 'aaRouteToHG',
      templateUrl: 'modules/huron/features/autoAttendant/routeToHG/aaRouteToHG.tpl.html'
    };
  }
})();
