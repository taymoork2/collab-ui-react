(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaNewCardCustom', aaNewCardCustom);

  function aaNewCardCustom() {
    return {
      scope: false,
      restrict: 'E',
      templateUrl: 'modules/huron/features/autoAttendant/aaNewCardCustom.tpl.html'
    };
  }
})();
