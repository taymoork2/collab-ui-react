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
        type: '@aaMediaType',
        isMenuHeader: '@aaMenuHeader',
        fromSubMenu: '@aaFromSubMenu',
        menuKeyIndex: '@aaKeyIndex',
        fromNewTreatment: '@aaFromNewTreatment',
      },
      controller: 'AAMessageTypeCtrl',
      controllerAs: 'aaMessageType',
      template: require('modules/huron/features/autoAttendant/messageType/aaMessageType.tpl.html'),
    };
  }
})();
