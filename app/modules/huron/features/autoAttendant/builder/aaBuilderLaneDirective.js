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
        templateUrl: 'modules/huron/features/autoAttendant/builder/aaBuilderLane.tpl.html'
      };
    }
  ]);
