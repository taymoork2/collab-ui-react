(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaDialByExt', aaDialByExt);

  function aaDialByExt() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        fromSubMenu: '@aaFromSubMenu',
        menuKeyIndex: '@aaKeyIndex',
        routingPrefixOptions: '=aaRoutingPrefixOptions',
      },
      controller: 'AADialByExtCtrl',
      controllerAs: 'aaDialByExtCtrl',
      template: require('modules/huron/features/autoAttendant/dialByExt/aaDialByExt.tpl.html'),
    };
  }
})();
