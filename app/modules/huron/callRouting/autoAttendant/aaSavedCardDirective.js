'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaSavedCard', [
    function () {
      return {
        scope: false,
        restrict: 'E',
        templateUrl: 'modules/huron/callRouting/autoAttendant/aaSavedCard.tpl.html',
      };
    }
  ]);
