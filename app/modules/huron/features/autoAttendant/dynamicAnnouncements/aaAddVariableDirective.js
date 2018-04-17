(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaAddVariable', aaAddVariable);

  function aaAddVariable() {
    return {
      restrict: 'AE',
      scope: {
        elementId: '@dynamicPromptId',
        dynamicElement: '=dynamicElementString',
        schedule: '@aaSchedule',
        index: '=aaIndex',
        isMenuHeader: '@aaMenuHeader',
        menuKeyIndex: '@aaKeyIndex',
        menuId: '@aaMenuId',
        aaElementType: '@aaElementType',
        type: '@aaAnnouncementType',
      },
      controller: 'AAAddVariableCtrl',
      controllerAs: 'aaAddVariable',
      template: require('modules/huron/features/autoAttendant/dynamicAnnouncements/aaAddVariableDirective.tpl.html'),
    };
  }
})();
