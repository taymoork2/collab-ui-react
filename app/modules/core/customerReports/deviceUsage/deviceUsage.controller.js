(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageCtrl', DeviceUsageCtrl);

  /* @ngInject */
  function DeviceUsageCtrl($log, $q, $translate, $state, $scope, DeviceUsageTotalService, Notification, deviceUsageFeatureToggle, DeviceUsageCommonService) {
    var vm = this;
    var amChart;
    var apiToUse = 'mock';

    vm.leastUsedDevices = [];
    vm.mostUsedDevices = [];

    vm.totalDuration = "...";
    vm.noOfCalls = "...";
    vm.noOfDevices = "...";

    vm.loading = true;
    vm.exporting = false;
    vm.noDataForRange = false;

    var dateRange;
    vm.exportRawData = exportRawData;

    vm.deviceOptions = [
      {
        value: 0,
        label: $translate.instant('reportsPage.usageReports.deviceOptions.all')
      },
      {
        value: 1,
        label: $translate.instant('reportsPage.usageReports.deviceOptions.roomSystems')
      },
      {
        value: 2,
        label: $translate.instant('reportsPage.usageReports.deviceOptions.sparkBoard')
      }
    ];
    vm.deviceFilter = vm.deviceOptions[0];

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
        value.time = key;
        return value;
      }).value();
      //$log.info('extractDeviceType extract', extract);
      return extract;
    }

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    $scope.$on('time-range-changed', function (event, timeSelected) {
      vm.deviceFilter = vm.deviceOptions[0];
      switch (timeSelected.value) {
        case 0:
          loadLastWeek();
          dateRange = DeviceUsageTotalService.getDateRangeForLastNTimeUnits(7, 'day');
          break;
        case 1:
          loadLastMonth();
          dateRange = DeviceUsageTotalService.getDateRangeForLastNTimeUnits(4, 'week');
          break;
        case 2:
          loadLast3Months();
          dateRange = DeviceUsageTotalService.getDateRangeForPeriod(3, 'month');
          break;
        default:
          loadLastWeek();
      }
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
      switch (DeviceUsageCommonService.getTimeSelected()) {
        case 0:
          loadLastWeek();
          dateRange = DeviceUsageTotalService.getDateRangeForLastNTimeUnits(7, 'day');
          break;
        case 1:
          loadLastMonth();
          dateRange = DeviceUsageTotalService.getDateRangeForLastNTimeUnits(4, 'week');
          break;
        case 2:
          loadLast3Months();
          dateRange = DeviceUsageTotalService.getDateRangeForPeriod(3, 'month');
          break;
        default:
          $log.warn("Unknown time period selected");
          loadLastWeek();
          dateRange = DeviceUsageTotalService.getDateRangeForLastNTimeUnits(7, 'day');
      }

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
      if (data.length === 0) {
        vm.noDataForRange = true;
        var warning = 'No report data available for : \n' + dateRange.start + ' to ' + dateRange.end;
        Notification.notify([warning], 'warning');
      } else {
        vm.noDataForRange = false;
      }
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
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastNTimeUnits(7, 'day', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last7Days'));
      }, handleReject);
    }

    function loadLastMonth() {
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastNTimeUnits(4, 'week', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last4Weeks'));
      }, handleReject);
    }

    function loadLast3Months() {
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastMonths(3, 'month', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last3Months'));
      }, handleReject);
    }

    function handleMissingDays(info) {
      //$log.info('missingDays', info);
      var warning = 'Data missing for ' + info.nbrOfMissingDays + ' days';
      Notification.notify([warning], 'warning');
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
      var text = '<div><h5>' + $translate.instant('reportsPage.usageReports.callDuration') + ' : ' + graphDataItem.dataContext.totalDuration + '</h5>';
      text = text + $translate.instant('reportsPage.usageReports.callCount') + ' : ' + graphDataItem.dataContext.callCount + ' <br/> ';
      text = text + $translate.instant('reportsPage.usageReports.pairedCount') + ' : ' + graphDataItem.dataContext.pairedCount + '<br/>';
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
      //$log.info("Exporting data for range", dateRange);
      DeviceUsageTotalService.exportRawData(dateRange.start, dateRange.end).then(function () {
        //$log.info("export finished");
        vm.exporting = false;
      })
      .catch(function (err) {
        $log.warn("Export failed", err);
      });
    }

  }

})();
