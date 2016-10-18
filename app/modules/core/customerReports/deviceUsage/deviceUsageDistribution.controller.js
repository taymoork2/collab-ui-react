(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageDistributionCtrl', DeviceUsageDistributionCtrl);

  /* @ngInject */
  function DeviceUsageDistributionCtrl($log, $state, $stateParams, DeviceUsageDistributionReportService, DeviceUsageDistributionGraphService, deviceUsageFeatureToggle) {
    var vm = this;

    vm.reportType = $stateParams.deviceReportType;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    var graph;

    DeviceUsageDistributionReportService.getDeviceUsageReportData().then(function (devices) {
      var inUseData = DeviceUsageDistributionGraphService.getUsageDistributionData(devices);
      var chart = DeviceUsageDistributionGraphService.getUsageCharts(inUseData, "usageHours");
      chart.dataProvider = inUseData;
      chart.listeners = [{
        "event": "clickGraphItem",
        "method": showList
      }];
      graph = AmCharts.makeChart('device-usage-distribution-chart', chart);
    });

    vm.gridOptions = {
      multiSelect: false,
      rowHeight: 40,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableHorizontalScrollbar: 0,
      columnDefs: [{
        field: 'deviceId',
        displayName: 'Device Id',
      }, {
        field: 'totalDuration',
        displayName: 'Hours active',
      }]
    };

    function showList(e) {
      var clickedIndex = e.index;
      _.each(e.chart.dataProvider, function (bar, index) {
        if (index != clickedIndex) {
          bar.alpha = "0.3";
        } else {
          bar.alpha = "1.0";
        }
      });

      graph.validateData();

      var limits = DeviceUsageDistributionGraphService.getDistributionLimits();
      limits.unshift(0);
      limits.push(_.last(limits));

      DeviceUsageDistributionReportService.getDeviceUsageReportData(limits[clickedIndex], limits[clickedIndex + 1]).then(function (devices) {
        vm.gridOptions.data = devices;
      });

    }


  }

})();
