(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageCtrl', DeviceUsageCtrl);

  /* @ngInject */
  function DeviceUsageCtrl($log, $q, $translate, $scope, DeviceUsageTotalService, Notification, DeviceUsageSplunkMetricsService, ReportConstants, CardUtils) {
    var vm = this;
    var amChart;
    var apiToUse = 'backend';
    var missingDays;
    var dateRange;

    vm.leastUsedDevices = [];
    vm.mostUsedDevices = [];

    vm.totalDuration = "...";
    vm.noOfCalls = "...";
    vm.noOfDevices = "...";

    vm.loading = true;
    vm.exporting = false;
    vm.noDataForRange = false;

    vm.exportRawData = exportRawData;
    vm.init = init;
    vm.timeUpdate = timeUpdate;

    vm.tabs = [
      {
        title: $translate.instant('reportsPage.usageReports.all'),
        state: 'reports.device-usage'
      }
    ];

    vm.timeOptions = _.cloneDeep(ReportConstants.timeFilter);
    vm.timeSelected = vm.timeOptions[0];

    function timeUpdate() {
      DeviceUsageSplunkMetricsService.reportOperation(DeviceUsageSplunkMetricsService.eventTypes.timeRangeSelected, vm.timeSelected);
      vm.deviceFilter = vm.deviceOptions[0];
      switch (vm.timeSelected.value) {
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
          dateRange = DeviceUsageTotalService.getDateRangeForLastNTimeUnits(3, 'month');
          break;
        default:
          loadLastWeek();
      }
    }

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
          loadChartDataForDeviceType(extractDeviceType('SparkBoard'));
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
        value.totalDuration = (value.totalDuration / 3600).toFixed(2);
        value.time = key;
        return value;
      }).value();
      //$log.info('extractDeviceType extract', extract);
      return extract;
    }

    $scope.$watch(function () {
      return angular.element('#device-usage-total-chart').is(':visible');
    }, init);

    function init() {
      var chart = DeviceUsageTotalService.getLineChart();
      chart.listeners = [
        { event: 'rollOverGraphItem', method: rollOverGraphItem },
        { event: 'rollOutGraphItem', method: rollOutGraphItem },
        { event: 'dataUpdated', method: graphRendered },
        { event: 'clickGraphItem', method: graphClick }
      ];
      amChart = DeviceUsageTotalService.makeChart('device-usage-total-chart', chart);
      loadInitData();
    }

    function loadInitData() {
      switch (vm.timeSelected.value) {
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
          dateRange = DeviceUsageTotalService.getDateRangeForLastNTimeUnits(3, 'month');
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

    function graphClick() {
      DeviceUsageSplunkMetricsService.reportOperation(DeviceUsageSplunkMetricsService.eventTypes.graphClick);
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
      dateRange = '';
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
        if (missingDays) {
          amChart.categoryAxis.title += missingDays;
        }
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
      missingDays = null;
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastNTimeUnits(7, 'day', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last7Days'));
      }, handleReject);
    }

    function loadLastMonth() {
      missingDays = null;
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastNTimeUnits(4, 'week', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last4Weeks'));
      }, handleReject);
    }

    function loadLast3Months() {
      missingDays = null;
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastNTimeUnits(3, 'month', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last3Months'));
      }, handleReject);
    }

    function handleMissingDays(info) {
      //$log.info('missingDays', info);
      var nbrOfMissingDays = info.missingDays.length;
      var warning = $translate.instant('reportsPage.usageReports.missingDays', { nbrOfMissingDays: nbrOfMissingDays }); //' (Data missing for ' + nbrOfMissingDays + ' days)';
      missingDays = warning;
      //Notification.notify([warning], 'warning');
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

    function fillInStats(data) {
      var stats = DeviceUsageTotalService.extractStats(data);
      vm.totalDuration = secondsTohhmmss(stats.totalDuration);
      vm.noOfCalls = stats.noOfCalls;
      vm.noOfDevices = stats.noOfDevices;

      vm.mostUsedDevices = [];
      vm.leastUsedDevices = [];

      resolveDeviceData(stats.most, vm.mostUsedDevices)
        .then(resolveDeviceData(stats.least, vm.leastUsedDevices))
        .then(reInstantiateMasonry);
    }

    function resolveDeviceData(stats, target) {
      return DeviceUsageTotalService.resolveDeviceData(stats)
        .then(function (deviceInfo) {
          _.each(stats, function (device, index) {
            target.push({ "name": deviceInfo[index].displayName, "duration": secondsTohhmmss(device.totalDuration), "calls": device.callCount });
          });
        });
    }

    function reInstantiateMasonry() {
      CardUtils.resize(0, 'score-card.cs-card-layout');
    }

    function secondsTohhmmss(totalSeconds) {
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
      var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

      // round seconds
      seconds = Math.round(seconds * 100) / 100;

      var result = hours > 0 ? hours + 'h ' : '';
      if (hours > 99) {
        return result;
      }
      result += minutes > 0 ? minutes + 'm ' : '';
      result += hours < 10 ? seconds + 's' : '';
      return result;
    }

    function exportRawData() {
      vm.exporting = true;
      var exportStarted = moment();
      DeviceUsageTotalService.exportRawData(dateRange.start, dateRange.end, apiToUse).then(function () {
        //$log.info("export finished");
        var now = moment();
        var data = {
          timeSelected: vm.timeSelected,
          duration: now.diff(exportStarted).valueOf()
        };
        DeviceUsageSplunkMetricsService.reportOperation(DeviceUsageSplunkMetricsService.eventTypes.fullReportDownload, data);
        vm.exporting = false;
      })
      .catch(function (err) {
        $log.warn("Export failed", err);
      });
    }

  }

})();
