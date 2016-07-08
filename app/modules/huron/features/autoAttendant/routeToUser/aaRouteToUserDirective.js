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
        fromRouteCall: '@aaFromRouteCall'
      },
      controller: 'AARouteToUserCtrl',
      controllerAs: 'aaRouteUser',
      templateUrl: 'modules/huron/features/autoAttendant/routeToUser/aaRouteToUser.tpl.html'
    };
  }
})();
