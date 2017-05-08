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
      },
      controller: 'AAInsertionElementCtrl',
      controllerAs: 'aaInsertionElement',
      templateUrl: 'modules/huron/features/autoAttendant/dynamicAnnouncements/aaInsertionElement.tpl.html',
    };
  }
})();
