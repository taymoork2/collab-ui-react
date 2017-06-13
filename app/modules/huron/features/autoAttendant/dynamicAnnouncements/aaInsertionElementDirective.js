(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaInsertionElement', aaInsertionElement);

  function aaInsertionElement() {
    return {
      restrict: 'AE',
      scope: {
        textValue: '@elementText',
        readAs: '@readAs',
        elementId: '@elementId',
        schedule: '@aaSchedule',
        index: '=aaIndex',
      },
      controller: 'AAInsertionElementCtrl',
      controllerAs: 'aaInsertionElement',
      templateUrl: 'modules/huron/features/autoAttendant/dynamicAnnouncements/aaInsertionElement.tpl.html',
    };
  }
})();
