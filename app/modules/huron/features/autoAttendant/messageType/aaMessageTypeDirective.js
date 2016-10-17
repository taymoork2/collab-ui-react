(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaMessageType', aaMessageType);

  function aaMessageType() {
    return {
      restrict: 'AE',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex'
      },
      controller: 'AAMessageTypeCtrl',
      controllerAs: 'aaMessageType',
      templateUrl: 'modules/huron/features/autoAttendant/messageType/aaMessageType.tpl.html'
    };
  }
})();
