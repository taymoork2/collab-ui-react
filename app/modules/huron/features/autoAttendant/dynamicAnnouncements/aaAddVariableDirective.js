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
      },
      controller: 'AAAddVariableCtrl',
      controllerAs: 'aaAddVariable',
      templateUrl: 'modules/huron/features/autoAttendant/dynamicAnnouncements/aaAddVariableDirective.tpl.html',
    };
  }
})();
