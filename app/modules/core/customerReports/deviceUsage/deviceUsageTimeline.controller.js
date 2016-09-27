(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageTimelineCtrl', DeviceUsageTimelineCtrl);

  /* @ngInject */
  function DeviceUsageTimelineCtrl($log, $state, DeviceUsageTimelineService, deviceUsageFeatureToggle) {

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    //$scope.chartData = UsageByModeChartService.dataProviderTrend('week', 1, 'day');
    DeviceUsageTimelineService.getData('week', 1, 'day').then(function (data) {
      var chart = DeviceUsageTimelineService.getLineChart();
      chart.dataProvider = data;
      AmCharts.makeChart('device-usage-timeline-chart', chart);

    });

  }

})();
