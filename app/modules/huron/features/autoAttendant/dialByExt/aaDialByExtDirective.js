'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaDialByExt', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@aaSchedule',
          index: '=aaIndex',
          keyIndex: '@aaKeyIndex'
        },
        controller: 'AADialByExtCtrl',
        controllerAs: 'aaDialByExtCtrl',
        templateUrl: 'modules/huron/features/autoAttendant/dialByExt/aaDialByExt.tpl.html'
      };
    }
  ]);
