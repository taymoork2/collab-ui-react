'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaTimeoutInvalid', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@aaSchedule',
          index: '=aaIndex',
          keyIndex: '@aaKeyIndex',
          fromNewStepDialBy: '@aaFromNewStepDialBy'
        },
        controller: 'AATimeoutInvalidCtrl',
        controllerAs: 'aaTimeoutInvalidCtrl',
        templateUrl: 'modules/huron/features/autoAttendant/timeoutInvalid/aaTimeoutInvalid.tpl.html'
      };
    }
  ]);
