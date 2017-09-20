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
      },
      controller: 'AAInsertionElementCtrl',
      controllerAs: 'aaInsertionElement',
      template: require('modules/huron/features/autoAttendant/dynamicAnnouncements/aaInsertionElement.tpl.html'),
    };
  }
})();
