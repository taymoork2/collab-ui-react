(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaBuilderLane', aaBuilderLane);

  function aaBuilderLane() {
    return {
      restrict: 'E',
      scope: {
        schedule: '@aaSchedule',
      },
      controller: 'AABuilderLaneCtrl',
      controllerAs: 'aaLane',
      template: require('modules/huron/features/autoAttendant/builder/aaBuilderLane.tpl.html'),
    };
  }
})();
