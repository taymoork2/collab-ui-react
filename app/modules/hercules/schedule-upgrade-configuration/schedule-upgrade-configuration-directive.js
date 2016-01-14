(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('scheduleUpgradeConfiguration', ScheduleUpgradeConfigurationDirective);

  function ScheduleUpgradeConfigurationDirective() {
    return {
      scope: true,
      restrict: 'E',
      controller: 'ScheduleUpgradeConfigurationCtrl',
      controllerAs: 'scheduleUpgrade',
      bindToController: {
        serviceType: '='
      },
      templateUrl: 'modules/hercules/schedule-upgrade-configuration/schedule-upgrade-configuration.tpl.html'
    };
  }
}());
