require('./_device-usage.scss');
require('modules/core/reports/amcharts-export.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageCtrl', DeviceUsageCtrl);

  /* @ngInject */
  function DeviceUsageCtrl($state, $log, $q, $translate, $scope, DeviceUsageService, DeviceUsageTotalService, DeviceUsageGraphService, DeviceUsageDateService, DeviceUsageExportService, Notification, DeviceUsageSplunkMetricsService, ReportConstants, $modal) {
    var vm = this;
    var amChart;
    var apiToUse = 'backend';
    var missingDays;
    var dateRange;

    // Models Selection
    vm.modelsSelected = [];
    vm.modelOptions = [];
    // Will have format ala this.
    /*
    vm.modelOptions = [
      {
        'value': 'Cisco TelePresence SX10',
        'label': 'Cisco TelePresence SX10',
        isSelected: false
      },
      {
        'value': 'Cisco TelePresence MX200 G2',
        'label': 'Cisco TelePresence MX200 G2',
        isSelected: false
      },
      {
        'value': 'Cisco Spark Board 55',
        'label': 'Cisco Spark Board 55',
        isSelected: false
      },
      {
        'value': 'Cisco TelePresence DX70',
        'label': 'Cisco TelePresence DX70',
        isSelected: false
      },
      {
        'value': 'Cisco TelePresence DX80',
        'label': 'Cisco TelePresence DX80',
        isSelected: false
      }
    ];
    */
    vm.selectModelsPlaceholder = 'Select models to filter on';

    vm.leastUsedDevices = [];
    vm.mostUsedDevices = [];

    vm.totalDuration = "...";
    vm.noOfCalls = "...";
    vm.noOfDevices = "...";

    vm.loading = true;
    vm.exporting = false;
    vm.noDataForRange = false;

    vm.init = init;
    vm.timeUpdate = timeUpdate;

    // Preliminary beta functionality
    if ($state.current.name === 'reports.device-usage-v2') {
      apiToUse = 'local';
      DeviceUsageTotalService = DeviceUsageService;
    }

    vm.tabs = [
      {
        title: $translate.instant('reportsPage.usageReports.all'),
        state: 'reports.device-usage'
      }
    ];

    vm.timeOptions = _.cloneDeep(ReportConstants.TIME_FILTER);
    vm.timeSelected = vm.timeOptions[0];

    function timeUpdate() {
      vm.modelsSelected = [];
      vm.modelOptions = [];
      DeviceUsageSplunkMetricsService.reportOperation(DeviceUsageSplunkMetricsService.eventTypes.timeRangeSelected, vm.timeSelected);
      vm.deviceFilter = vm.deviceOptions[0];
      switch (vm.timeSelected.value) {
        case 0:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(7, 'day');
          loadLastWeek(dateRange);
          break;
        case 1:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(4, 'week');
          loadLastMonth(dateRange);
          break;
        case 2:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(3, 'month');
          loadLast3Months(dateRange);
          break;
        default:
          $log.warn("Unknown time period selected");
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(7, 'day');
          loadLastWeek(dateRange);
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
      var chart = DeviceUsageGraphService.getLineChart();
      chart.startEffect = 'easeInSine';
      chart.startDuration = 0.5;
      chart.zoomOutOnDataUpdate = true;
      chart.listeners = [
        { event: 'rollOverGraphItem', method: rollOverGraphItem },
        { event: 'rollOutGraphItem', method: rollOutGraphItem },
        { event: 'dataUpdated', method: graphRendered },
        { event: 'clickGraphItem', method: graphClick }
      ];
      amChart = DeviceUsageGraphService.makeChart('device-usage-total-chart', chart);
      loadInitData();
    }

    function loadInitData() {
      switch (vm.timeSelected.value) {
        case 0:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(7, 'day');
          loadLastWeek(dateRange);
          break;
        case 1:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(4, 'week');
          loadLastMonth(dateRange);
          break;
        case 2:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(3, 'month');
          loadLast3Months(dateRange);
          break;
        default:
          $log.warn("Unknown time period selected");
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(7, 'day');
          loadLastWeek(dateRange);
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
      amChart.animateAgain();
      vm.showDevices = false;
      fillInStats(data);
    }

    function loadChartDataForDeviceType(data) {
      amChart.dataProvider = data;
      amChart.validateData();
    }

    function loadLastWeek(dates) {
      missingDays = null;
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForRange(dates.start, dates.end, 'day', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last7Days'));
      }, handleReject);
    }

    function loadLastMonth(dates) {
      missingDays = null;
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForRange(dates.start, dates.end, 'week', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last4Weeks'));
      }, handleReject);
    }

    function loadLast3Months(dates) {
      missingDays = null;
      var missingDaysDeferred = $q.defer();
      missingDaysDeferred.promise.then(handleMissingDays);
      vm.loading = true;
      DeviceUsageTotalService.getDataForRange(dates.start, dates.end, 'month', ['ce', 'sparkboard'], apiToUse, missingDaysDeferred).then(function (data) {
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
        .then(resolveDeviceData(stats.least, vm.leastUsedDevices));
    }

    function resolveDeviceData(stats, target) {
      return DeviceUsageTotalService.resolveDeviceData(stats)
        .then(function (deviceInfo) {
          _.each(stats, function (device, index) {
            target.push({ "name": deviceInfo[index].displayName, "duration": secondsTohhmmss(device.totalDuration), "calls": device.callCount });
          });
        });
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

    var exportProgressDialog;
    vm.openExportProgressTracker = function () {
      exportProgressDialog = $modal.open({
        templateUrl: 'modules/core/customerReports/deviceUsage/deviceUsageExport/devices-usage-export-progress.html',
        type: 'dialog',
        controller: function () {
          var vm = this;
          vm.cancelExport = function () {
            DeviceUsageExportService.cancelExport();
          };
        },
        controllerAs: 'vm',
      });
      exportProgressDialog.opened.then(function () {
        vm.exporting = true;
        exportStarted = moment();
        DeviceUsageExportService.exportData(dateRange.start, dateRange.end, apiToUse, vm.exportStatus);
      });
    };

    vm.startDeviceUsageExport = function () {
      $modal.open({
        templateUrl: "modules/core/customerReports/deviceUsage/deviceUsageExport/devices-usage-export.html",
        type: 'dialog'
      }).result.then(function () {
        vm.openExportProgressTracker();
      }, function () {
        vm.exporting = false;
      });
    };

    var exportStarted;
    vm.exportStatus = function (percent) {
      if (percent === 100) {
        exportProgressDialog.close();
        var now = moment();
        var data = {
          timeSelected: vm.timeSelected,
          duration: now.diff(exportStarted).valueOf()
        };
        DeviceUsageSplunkMetricsService.reportOperation(DeviceUsageSplunkMetricsService.eventTypes.fullReportDownload, data);
        vm.exporting = false;
        var title = $translate.instant('reportsPage.usageReports.export.exportCompleted');
        var text = $translate.instant('reportsPage.usageReports.export.deviceUsageListReadyForDownload');
        Notification.success(text, title);
      } else if (percent === -1) {
        exportProgressDialog.close();
        vm.exporting = false;
        var warn = $translate.instant('reportsPage.usageReports.export.deviceUsageExportFailedOrCancelled');
        Notification.warning(warn);
      }
    };

  }

})();
