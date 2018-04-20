(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaRouteToUser', aaRouteToUser);

  function aaRouteToUser() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
        voicemail: '=',
        fromRouteCall: '@aaFromRouteCall',
        fromDecision: '@aaFromDecision',
        fromFallback: '@aaFromFallback',
      },
      controller: 'AARouteToUserCtrl',
      controllerAs: 'aaRouteUser',
      template: require('modules/huron/features/autoAttendant/routeToUser/aaRouteToUser.tpl.html'),
    };
  }
})();
