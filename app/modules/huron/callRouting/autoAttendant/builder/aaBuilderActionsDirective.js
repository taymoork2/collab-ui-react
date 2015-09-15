'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaBuilderActions', [
    function () {
      return {
        restrict: 'E',
        transclude: true,
        scope: {
          schedule: '=',
          index: '='
        },
        templateUrl: 'modules/huron/callRouting/autoAttendant/builder/aaBuilderActions.tpl.html'
      };
    }
  ]);
