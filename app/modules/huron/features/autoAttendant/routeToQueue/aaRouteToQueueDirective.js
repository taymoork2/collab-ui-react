(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaRouteToQueue', aaRouteToQueue);

  function aaRouteToQueue() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
        fromRouteCall: '@aaFromRouteCall'
      },
      controller: 'AARouteToQueueCtrl',
      controllerAs: 'aaRouteToQueue',
      templateUrl: 'modules/huron/features/autoAttendant/routeToQueue/aaRouteToQueue.tpl.html'
    };
  }
})();
