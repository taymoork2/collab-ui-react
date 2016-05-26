(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('scheduleUpgradeConfiguration', scheduleUpgradeConfiguration);

  function scheduleUpgradeConfiguration() {
    return {
      scope: true,
      restrict: 'E',
      controller: 'ScheduleUpgradeConfigurationCtrl',
      controllerAs: 'scheduleUpgrade',
      bindToController: {
        connectorType: '='
      },
      templateUrl: 'modules/hercules/schedule-upgrade-configuration/schedule-upgrade-configuration.directive.html'
    };
  }
}());
