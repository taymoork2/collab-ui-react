(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageOverviewCtrl', DeviceUsageOverviewCtrl);

  /* @ngInject */
  function DeviceUsageOverviewCtrl($log, $state, $stateParams, DeviceUsageOverviewService, deviceUsageFeatureToggle) {
    var vm = this;
    vm.reportType = $stateParams.deviceReportType;
    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    DeviceUsageOverviewService.getData().then(function (data) {
      var chart = DeviceUsageOverviewService.getPieChart();
      chart.dataProvider = data;
      AmCharts.makeChart('device-usage-overview-chart', chart);
    });
  }

})();
