(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaSubmenu', aaSubmenu);

  function aaSubmenu() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
        queues: '@aaQueues',
        routingPrefixOptions: '=aaRoutingPrefixOptions',
      },
      controller: 'AASubmenuCtrl',
      controllerAs: 'aaSubmenu',
      template: require('modules/huron/features/autoAttendant/submenu/aaSubmenu.tpl.html'),
    };
  }
})();
