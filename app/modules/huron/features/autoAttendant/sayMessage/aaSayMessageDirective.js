(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaSayMessage', aaSayMessage);

  function aaSayMessage() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        isMenuHeader: '=aaHeader',
        menuKeyIndex: '@aaKeyIndex',
        fromSubMenu: '@aaFromSubMenu',
      },
      controller: 'AASayMessageCtrl',
      controllerAs: 'aaSay',
      template: require('modules/huron/features/autoAttendant/sayMessage/aaSayMessage.tpl.html'),
    };
  }
})();
