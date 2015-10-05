'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaBuilderLane', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@aaSchedule'
        },
        controller: 'AABuilderLaneCtrl',
        controllerAs: 'aaLane',
        templateUrl: 'modules/huron/callRouting/autoAttendant/builder/aaBuilderLane.tpl.html'
      };
    }
  ]);
