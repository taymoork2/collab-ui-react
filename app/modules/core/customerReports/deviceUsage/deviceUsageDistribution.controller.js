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
    vm.leastUsedDevices = [];
    vm.mostUsedDevices = [];
    vm.noOfDevices = 0;
    vm.toggleGraph = toggleGraph;
    vm.formatSecondsToHrsMinSec = formatSecondsToHrsMinSec;

    //TODO: Replace by range selector
    var now = new moment().format("YYYY-MM-DD");
    var from = moment(now).subtract(30, "days").format("YYYY-MM-DD");
    var to = moment(now).subtract(23, "days").format("YYYY-MM-DD");
    $log.info("from", from);
    $log.info("to", to);

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    var graph;

    function pad(num, size) {
      var s = "00000000" + num;
      return s.substr(s.length - size);
    }

    function formatSecondsToHrsMinSec(sec) {
      var hours = parseInt(sec / 3600, 10);
      var minutes = parseInt((sec - (hours * 3600)) / 60, 10);
      var seconds = Math.floor((sec - ((hours * 3600) + (minutes * 60))));
      if (hours < 10) {
        hours = pad(hours, 2);
      }
      return hours + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
    }


    DeviceUsageDistributionReportService.getDeviceUsageReportData(from, to).then(function (devices) {
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


    DeviceUsageDistributionReportService.getAllDevicesSorted(from, to).then(function (devices) {

      $log.warn("ALL DEVICES", devices);
      vm.noOfDevices = devices.length;
      $log.warn("top5", _.takeRight(devices, 5).reverse());
      $log.warn("bottom5", _.take(devices, 5));

      var top5 = _.takeRight(devices, 5).reverse();
      var bottom5 = _.take(devices, 5);

      DeviceUsageDistributionReportService.resolveDeviceData(top5)
        .then(function (deviceInfo) {
          _.each(top5, function (topDevice, index) {
            vm.mostUsedDevices.push({ "name": deviceInfo[index].displayName, "duration": formatSecondsToHrsMinSec(topDevice.totalDuration), "calls": topDevice.callCount });
          });
        });

      DeviceUsageDistributionReportService.resolveDeviceData(bottom5)
        .then(function (deviceInfo) {
          _.each(bottom5, function (bottomDevice, index) {
            vm.leastUsedDevices.push({ "name": deviceInfo[index].displayName, "duration": formatSecondsToHrsMinSec(bottomDevice.totalDuration), "calls": bottomDevice.callCount });
          });
        });
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

      DeviceUsageDistributionReportService.getDeviceUsageReportData(to, from, limits[clickedIndex], limits[clickedIndex + 1]).then(function (devices) {
        $log.warn("distrubutiondata", devices);
        vm.gridOptions.data = devices;
      });

    }

  }

})();
