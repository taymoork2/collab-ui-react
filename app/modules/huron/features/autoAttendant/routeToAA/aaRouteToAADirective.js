(function() {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaRouteToAa', aaRouteToAa);

  function aaRouteToAa() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
        fromRouteCall: '@aaFromRouteCall'
      },
      controller: 'AARouteToAACtrl',
      controllerAs: 'aaRouteToAA',
      templateUrl: 'modules/huron/features/autoAttendant/routeToAA/aaRouteToAA.tpl.html'
    };
  }
})();