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
        menuKeyIndex: '@aaKeyIndex'
      },
      controller: 'AASayMessageCtrl',
      controllerAs: 'aaSay',
      templateUrl: 'modules/huron/features/autoAttendant/sayMessage/aaSayMessage.tpl.html'
    };
  }
})();
