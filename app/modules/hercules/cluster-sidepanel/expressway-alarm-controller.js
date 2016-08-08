(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayAlarmController', ExpresswayAlarmController);

  /* @ngInject */
  function ExpresswayAlarmController($stateParams) {
    var vm = this;
    vm.alarm = $stateParams.alarm;
    vm.parseDate = function (timestamp) {
      return new Date(Number(timestamp) * 1000);
    };
    if (vm.alarm.solution) {
      vm.alarm.alarmSolutionElements = [];
      if (_.size(vm.alarm.solutionReplacementValues) > 0) {
        var i = 0;
        _.forEach(vm.alarm.solution.split('%s'), function (value) {
          vm.alarm.alarmSolutionElements.push({text: value});
          var replacementValue = vm.alarm.solutionReplacementValues[i++];
          if (replacementValue) {
            vm.alarm.alarmSolutionElements.push(replacementValue);
          }
        });
      } else {
        vm.alarm.alarmSolutionElements.push({text: vm.alarm.solution});
      }
    }
  }
}());
