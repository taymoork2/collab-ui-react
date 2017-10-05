(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaRouteToSipEndpoint', aaRouteToSipEndpoint);

  function aaRouteToSipEndpoint() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
        fromRouteCall: '@aaFromRouteCall',
        fromFallback: '@aaFromFallback',
      },
      template: require('modules/huron/features/autoAttendant/routeToSipEndpoint/aaRouteToSipEndpoint.tpl.html'),
      controllerAs: 'aaRouteToSip',
      controller: 'AARouteToSipEndpointCtrl',
    };
  }
})();
