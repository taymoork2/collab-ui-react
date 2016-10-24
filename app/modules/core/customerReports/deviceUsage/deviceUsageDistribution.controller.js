(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageDistributionCtrl', DeviceUsageDistributionCtrl);

  /* @ngInject */
  function DeviceUsageDistributionCtrl($log, $state, $stateParams, DeviceUsageDistributionReportService, DeviceUsageDistributionGraphService, deviceUsageFeatureToggle) {
    var vm = this;

    vm.reportType = $stateParams.deviceReportType;
    vm.loading = true;

    vm.toggleGraph = toggleGraph;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    var graph;

    DeviceUsageDistributionReportService.getDeviceUsageReportData().then(function (devices) {
      var inUseData = DeviceUsageDistributionGraphService.getUsageDistributionDataForGraph(devices);
      var chart = DeviceUsageDistributionGraphService.getUsageCharts(inUseData, "usageHours");
      chart.dataProvider = inUseData;
      $log.warn("DATA PROVIDER SET!", inUseData);
      chart.listeners = [
        { event: 'clickGraphItem', method: showList },
        { event: 'dataUpdated', method: graphRendered }
      ];

      graph = AmCharts.makeChart('device-usage-distribution-chart', chart);
    });

    function graphRendered() {
      vm.loading = false;
    }

    vm.showGraph = false;
    function toggleGraph() {
      vm.showGraph = !vm.showGraph;
    }

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
        $log.warn("distrubutiondata", devices);
        vm.gridOptions.data = devices;
      });

    }

    vm.leastUsedDevices = [
      { name: "Bergen", hours: 2, lastTime: "6 days ago" },
      { name: "Oslo", hours: 2, lastTime: "5 days ago" },
      { name: "Trondheim", hours: 2, lastTime: "4 days ago" },
      { name: "K2", hours: 3, lastTime: "4 days ago" },
      { name: "MountEverest", hours: 3, lastTime: "3 days ago" }
    ];

    vm.mostUsedDevices = [
      { name: "Spitsbergen", hours: 160 },
      { name: "Molde", hours: 155 },
      { name: "Trolltunga", hours: 145 },
      { name: "Kilimanjaro", hours: 145 },
      { name: "Didrik", hours: 140 }
    ];

  }

})();
