'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaNewCardCustom', [
    function () {
      return {
        scope: false,
        restrict: 'E',
        templateUrl: 'modules/huron/callRouting/autoAttendant/aaNewCardCustom.tpl.html',
      };
    }
  ]);
