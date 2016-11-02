(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageCtrl', DeviceUsageCtrl);

  /* @ngInject */
  function DeviceUsageCtrl($log, $state, $scope, DeviceUsageTotalService, Notification, deviceUsageFeatureToggle, DeviceUsageCommonService) {
    var vm = this;
    var amChart;
    var apiToUse = 'local';

    vm.leastUsedDevices = [];
    vm.mostUsedDevices = [];

    vm.totalDuration = "...";
    vm.noOfCalls = "...";
    vm.noOfDevices = "...";

    vm.loading = true;
    vm.exporting = false;

    vm.deviceOptions = [
      {
        value: 0,
        label: 'All',
        description: 'All CE and SparkBoard devices'
      },
      {
        value: 1,
        label: 'CE',
        description: 'All CE devices'
      },
      {
        value: 2,
        label: 'SparkBoard',
        description: 'All SparkBoard devices'
      }
    ];
    vm.deviceFilter = vm.deviceOptions[0];
    //vm.currentFilter = vm.deviceOptions[0].value;

    vm.deviceUpdate = function () {
      //$log.info('deviceFilter', vm.deviceFilter);
      switch (vm.deviceFilter.value) {
        case 0:
          loadChartDataForDeviceType(vm.reportData);
          break;
        case 1:
          loadChartDataForDeviceType(extractDeviceType('ce'));
          break;
        case 2:
          loadChartDataForDeviceType(extractDeviceType('sparkboard'));
          break;
      }
    };

    function extractDeviceType(deviceCategory) {
      //$log.info('extract device type', deviceCategory);
      $log.info('extractDeviceType data', vm.reportData);
      var extract = _.chain(vm.reportData).reduce(function (result, item) {
        if (typeof result[item.time] === 'undefined') {
          result[item.time] = {
            callCount: 0,
            totalDuration: 0,
            pairedCount: 0,
          };
        }
        if (item.deviceCategories[deviceCategory]) {
          result[item.time].callCount += item.deviceCategories[deviceCategory].callCount;
          result[item.time].totalDuration += item.deviceCategories[deviceCategory].totalDuration;
          result[item.time].pairedCount += item.deviceCategories[deviceCategory].pairedCount;
        }
        return result;
      }, {}).map(function (value, key) {
        value.totalDuration = (value.totalDuration / 60).toFixed(2);
        // var timeFormatted = key.substr(0, 4) + '-' + key.substr(4, 2) + '-' + key.substr(6, 2);
        value.time = key;
        return value;
      }).value();
      $log.info('extractDeviceType extract', extract);
      return extract;
    }

    var startDate;
    var endDate;

    vm.exportRawData = exportRawData;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    $scope.$on('time-range-changed', function (event, timeSelected) {
      var dateRange;
      vm.deviceFilter = vm.deviceOptions[0];
      switch (timeSelected.value) {
        case 0:
          dateRange = DeviceUsageTotalService.getDatesForLastWeek(); // TODO Fix
          loadLastWeek();
          break;
        case 1:
          dateRange = DeviceUsageTotalService.getDatesForLastMonths(1); // TODO Fix
          loadLastMonth();
          break;
        case 2:
          dateRange = DeviceUsageTotalService.getDatesForLastMonths(3); // TODO Fix
          loadLast3Months();
          break;
        default:
          loadLastWeek();
      }
      startDate = dateRange.start;
      endDate = dateRange.end;
    });

    $scope.$watch(function () {
      return angular.element('#device-usage-total-chart').is(':visible');
    }, init);

    function init() {
      var chart = DeviceUsageTotalService.getLineChart();
      chart.listeners = [
      { event: 'rollOverGraphItem', method: rollOverGraphItem },
      { event: 'rollOutGraphItem', method: rollOutGraphItem },
      { event: 'dataUpdated', method: graphRendered }
      ];

      amChart = AmCharts.makeChart('device-usage-total-chart', chart);
      _.each(amChart.graphs, function (graph) {
        graph.balloonFunction = renderBalloon;
      });
      loadInitData();
    }


    function loadInitData() {
      var dateRange;
      switch (DeviceUsageCommonService.getTimeSelected()) {
        case 0:
          dateRange = DeviceUsageTotalService.getDatesForLastWeek(); //TODO Fix
          //DeviceUsageTotalService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          DeviceUsageTotalService.getDataForLastNTimeUnits(7, 'day', ['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        case 1:
          dateRange = DeviceUsageTotalService.getDatesForLastMonths(1); // TODO Fix
          //DeviceUsageTotalService.getDataForLastMonth(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          DeviceUsageTotalService.getDataForLastNTimeUnits(4, 'week', ['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        case 2:
          dateRange = DeviceUsageTotalService.getDatesForLastMonths(3); // TODO Fix
          DeviceUsageTotalService.getDataForLastMonths(3, 'day', ['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        default:
          dateRange = DeviceUsageTotalService.getDatesForLastWeek(); // TODO Fix
          //DeviceUsageTotalService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          DeviceUsageTotalService.getDataForLastNTimeUnits(7, 'day', ['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
      }
      startDate = dateRange.start;
      endDate = dateRange.end;

    }

    function graphRendered() {
      vm.loading = false;
    }

    function handleReject(reject) {
      vm.loading = false;
      var errors = [];
      if (reject.data && reject.data.message) {
        errors.push(reject.data.message);
      } else {
        errors.push(reject.statusText);
      }
      amChart.dataProvider = [];
      amChart.validateData();
      vm.dateRange = '';
      Notification.notify(errors, 'error');
    }

    function loadChartData(data, title) {
      vm.reportData = data;
      amChart.dataProvider = data;
      if (title) {
        amChart.categoryAxis.title = title;
      }
      amChart.validateData();
      vm.showDevices = false;
      fillInStats(data);
    }

    function loadChartDataForDeviceType(data) {
      amChart.dataProvider = data;
      amChart.validateData();
    }

    function loadLastWeek() {
      vm.loading = true;
      // DeviceUsageTotalService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(function (data) {
      //   loadChartData(data, 'Daily in Week');
      // }, handleReject);

      DeviceUsageTotalService.getDataForLastNTimeUnits(7, 'day', ['ce', 'sparkboard'], apiToUse).then(function (data) {
        loadChartData(data, 'Daily in Week');
      }, handleReject);
    }

    function loadLastMonth() {
      vm.loading = true;
      // DeviceUsageTotalService.getDataForLastMonth(['ce', 'sparkboard'], apiToUse).then(function (data) {
      //   loadChartData(data, 'Weekly Last Month');
      // }, handleReject);
      DeviceUsageTotalService.getDataForLastNTimeUnits(4, 'week', ['ce', 'sparkboard'], apiToUse).then(function (data) {
        loadChartData(data, 'Weekly Last 4 Weeks');
      }, handleReject);
    }

    function loadLast3Months() {
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastMonths(3, 'month', ['ce', 'sparkboard'], apiToUse).then(function (data) {
        loadChartData(data, 'Monthly');
      }, handleReject);
    }

    function rollOverGraphItem(event) {
      vm.additionalInfo = true;
      vm.dayData = event.item.dataContext;
      $scope.$apply();
    }

    function rollOutGraphItem() {
      vm.additionalInfo = false;
      $scope.$apply();
    }

    function renderBalloon(graphDataItem) {
      var text = '<div><h5>Call Duration: ' + graphDataItem.dataContext.totalDuration + '</h5>';
      text = text + 'Call Count:  ' + graphDataItem.dataContext.callCount + ' <br/> ';
      text = text + 'Paired Count: ' + graphDataItem.dataContext.pairedCount + '<br/>';
      //text = text + 'Devices: ' + graphDataItem.dataContext.devices.length + '</div>';
      return text;
    }

    function fillInStats(data) {
      var stats = DeviceUsageTotalService.extractStats(data);
      vm.totalDuration = formatSecondsToHrsMinSec(stats.totalDuration);
      vm.noOfCalls = stats.noOfCalls;
      vm.noOfDevices = stats.noOfDevices;

      DeviceUsageTotalService.resolveDeviceData(stats.most)
        .then(function (deviceInfo) {
          vm.mostUsedDevices = [];
          _.each(stats.most, function (topDevice, index) {
            vm.mostUsedDevices.push({ "name": deviceInfo[index].displayName, "duration": formatSecondsToHrsMinSec(topDevice.totalDuration), "calls": topDevice.callCount });
          });
        });

      DeviceUsageTotalService.resolveDeviceData(stats.least)
        .then(function (deviceInfo) {
          vm.leastUsedDevices = [];
          _.each(stats.least, function (bottomDevice, index) {
            vm.leastUsedDevices.push({ "name": deviceInfo[index].displayName, "duration": formatSecondsToHrsMinSec(bottomDevice.totalDuration), "calls": bottomDevice.callCount });
          });
        });
    }

    function pad(num, size) {
      var s = "00000000" + num;
      return s.substr(s.length - size);
    }

    function formatSecondsToHrsMinSec(sec) {
      var hours = parseInt(sec / 3600, 10);
      var minutes = parseInt((sec - (hours * 3600)) / 60, 10);
      var seconds = Math.floor((sec - ((hours * 3600) + (minutes * 60))));
      if (hours > 99) {
        return hours + "h ";
      } else if (hours > 9) {
        return hours + "h " + pad(minutes, 2) + "m";
      } else if (hours >= 1) {
        return pad(hours, 2) + "h " + pad(minutes, 2) + "m";
      } else if (minutes > 10) {
        return pad(minutes, 2) + "m";
      } else if (minutes > 1) {
        return pad(minutes, 2) + "m " + pad(seconds, 2) + "s";
      } else {
        return "    " + pad(seconds, 2) + "s";
      }
    }

    function exportRawData() {
      vm.exporting = true;
      DeviceUsageTotalService.exportRawData(startDate, endDate).then(function () {
        $log.info("export finished");
        vm.exporting = false;
      })
      .catch(function (err) {
        $log.warn("Export failed", err);
      });
    }

  }

})();
