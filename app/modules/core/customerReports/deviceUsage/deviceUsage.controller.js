require('./_device-usage.scss');
require('modules/core/reports/amcharts-export.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageCtrl', DeviceUsageCtrl);

  /* @ngInject */
  function DeviceUsageCtrl($log, $translate, $scope,
    DeviceUsageService, DeviceUsageGraphService,
    DeviceUsageDateService, DeviceUsageExportService, Notification,
    DeviceUsageSplunkMetricsService, ReportConstants, $modal, DeviceUsageModelService) {
    var vm = this;
    var amChart;
    var apiToUse = 'backend';
    var dateRange;

    // Models Selection
    vm.modelsSelected = [];
    vm.modelOptions = [];

    var allDeviceCategories = ['ce', 'SparkBoard', 'Novum'];

    vm.selectModelsPlaceholder = $translate.instant('reportsPage.usageReports.selectModelsToFilterOn');

    vm.leastUsedDevices = [];
    vm.mostUsedDevices = [];

    vm.totalDuration = '-';
    vm.noOfCalls = '-';
    vm.noOfDevices = '-';

    vm.waitForLeast = true;
    vm.waitForMost = true;
    vm.waitingForDeviceMetrics = true;
    vm.exporting = false;
    vm.noDataForRange = false;

    vm.init = init;
    vm.timeUpdate = timeUpdate;
    vm.doTimeUpdate = doTimeUpdate;

    vm.timeOptions = _.cloneDeep(ReportConstants.TIME_FILTER);
    vm.timeSelected = vm.timeOptions[0];

    function timeUpdate() {
      DeviceUsageService.cancelAllRequests().then(doTimeUpdate);
    }

    function clearDisplayedStats() {
      vm.totalDuration = '-';
      vm.noOfCalls = '-';
      vm.noOfDevices = '-';
      vm.leastUsedDevices = [];
      vm.mostUsedDevices = [];
    }

    function doTimeUpdate() {
      vm.modelsSelected = [];
      vm.modelOptions = [];
      clearDisplayedStats();
      vm.selectModelsPlaceholder = $translate.instant('reportsPage.usageReports.selectModelsToFilterOn');
      DeviceUsageSplunkMetricsService.reportOperation(DeviceUsageSplunkMetricsService.eventTypes.timeRangeSelected, vm.timeSelected);
      getDataForSelectedRange(vm.timeSelected.value);
    }

    function getDataForSelectedRange(timeSelected, models) {
      switch (timeSelected) {
        case 0:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(7, 'day');
          loadLastWeek(dateRange, models);
          break;
        case 1:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(4, 'week');
          loadLastMonth(dateRange, models);
          break;
        case 2:
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(3, 'month');
          loadLast3Months(dateRange, models);
          break;
        default:
          $log.warn('Unknown time period selected');
          dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(7, 'day');
          loadLastWeek(dateRange, models);
      }
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
        { event: 'clickGraphItem', method: graphClick },
      ];
      amChart = DeviceUsageGraphService.makeChart('device-usage-total-chart', chart);
      getDataForSelectedRange(vm.timeSelected.value);
    }

    function graphClick() {
      DeviceUsageSplunkMetricsService.reportOperation(DeviceUsageSplunkMetricsService.eventTypes.graphClick);
    }

    function handleReject(reject) {
      if (reject.cancelled === true) {
        return;
      }
      vm.waitingForDeviceMetrics = false;
      vm.waitForLeast = false;
      vm.waitForMost = false;
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

    function loadChartData(data, title, models) {
      var missingDays = data.missingDays;
      var reportItems = data.reportItems;
      if (reportItems.length === 0) {
        vm.noDataForRange = true;
        var warning = 'No report data available for : \n' + dateRange.start + ' to ' + dateRange.end;
        Notification.notify([warning], 'warning');
        clearDisplayedStats();
      } else {
        vm.noDataForRange = false;
        scaleYAxisToHaveRoomForTextOverBar(reportItems);
      }
      vm.reportData = reportItems;
      amChart.dataProvider = reportItems;

      if (title) {
        if (missingDays.count > 0) {
          var missingDaysWarning = $translate.instant('reportsPage.usageReports.missingDays', { nbrOfMissingDays: missingDays.count });
          amChart.categoryAxis.title = title + ' (' + missingDaysWarning + ')';
        } else {
          amChart.categoryAxis.title = title;
        }
      }
      amChart.validateData();
      amChart.animateAgain();
      vm.showDevices = false;
      fillInStats(reportItems, dateRange.start, dateRange.end, models);
    }

    function scaleYAxisToHaveRoomForTextOverBar(reportItems) {
      var max = _.maxBy(reportItems, 'totalDuration').totalDuration;
      amChart.valueAxes[0].maximum = (max / 3600) * 1.1;
    }

    function loadLastWeek(dates, models) {
      vm.waitingForDeviceMetrics = true;
      vm.waitForLeast = true;
      vm.waitForMost = true;
      DeviceUsageService.getDataForRange(dates.start, dates.end, 'day', models, apiToUse).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last7Days'), models);
        if (!models) {
          getModelsForRange(dates.start, dates.end).then(modelsForRange);
        }
      }, handleReject);
    }

    function loadLastMonth(dates, models) {
      vm.waitingForDeviceMetrics = true;
      vm.waitForLeast = true;
      vm.waitForMost = true;
      DeviceUsageService.getDataForRange(dates.start, dates.end, 'week', models, apiToUse).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last4Weeks'), models);
        if (!models) {
          getModelsForRange(dates.start, dates.end).then(modelsForRange);
        }
      }, handleReject);
    }

    function loadLast3Months(dates, models) {
      vm.waitingForDeviceMetrics = true;
      vm.waitForLeast = true;
      vm.waitForMost = true;
      DeviceUsageService.getDataForRange(dates.start, dates.end, 'month', models, apiToUse).then(function (data) {
        loadChartData(data, $translate.instant('reportsPage.usageReports.last3Months'), models);
        if (!models) {
          getModelsForRange(dates.start, dates.end).then(modelsForRange);
        }
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

    function fillInStats(data, start, end, models) {
      vm.mostUsedDevices = [];
      vm.leastUsedDevices = [];
      DeviceUsageService.extractStats(data, start, end, models).then(function (stats) {
        vm.totalDuration = secondsTohhmmss(stats.totalDuration);
        vm.noOfCalls = stats.noOfCalls;
        vm.noOfDevices = stats.noOfDevices;
        vm.waitingForDeviceMetrics = false;
        vm.peopleCount = stats.peopleCount;

        vm.peopleCount = _.groupBy(vm.peopleCount, function (pc) {
          return pc.accountId;
        });

        if (stats.most && stats.most.length > 0) {
          stats.most = vm.addPeopleCount(stats.most, vm.peopleCount);
          resolveDeviceData(stats.most, vm.mostUsedDevices)
            .then(function () {
              vm.waitForMost = false;
            });
        } else {
          vm.waitForMost = false;
        }

        if (stats.least && stats.least.length > 0) {
          stats.least = vm.addPeopleCount(stats.least, vm.peopleCount);
          resolveDeviceData(stats.least, vm.leastUsedDevices)
            .then(function () {
              vm.waitForLeast = false;
            });
        } else {
          vm.waitForLeast = false;
        }
      }).catch(function (error) {
        if (error.timedout) {
          clearDisplayedStats();
          vm.waitForLeast = false;
          vm.waitForMost = false;
          vm.waitingForDeviceMetrics = false;
          var msg = $translate.instant('reportsPage.usageReports.timeoutWhenFetchingMetrics');
          Notification.error(msg);
        }
      });
    }

    vm.addPeopleCount = function (object, people) {
      object = _.map(object, function (stat) {
        stat.peopleCount = '-';
        var peopleCount = _.find(people, function (pc) {
          return pc[0].accountId === stat.accountId;
        });
        if (peopleCount) {
          stat.peopleCount = parseInt(peopleCount[0]['peopleCountAvg'], 10);
        }
        return stat;
      });
      return object;
    };

    function resolveDeviceData(stats, target) {
      return DeviceUsageService.resolveDeviceData(stats, apiToUse)
        .then(function (deviceInfo) {
          _.each(stats, function (device, index) {
            target.push({
              name: deviceInfo[index].displayName,
              info: deviceInfo[index].info,
              peopleCount: device.peopleCount,
              duration: secondsTohhmmss(device.callDuration),
              calls: device.callCount,
            });
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
        template: require('modules/core/customerReports/deviceUsage/deviceUsageExport/devices-usage-export-progress.html'),
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
        DeviceUsageExportService.exportData(dateRange.start, dateRange.end, apiToUse, vm.exportStatus, allDeviceCategories);
      });
    };

    vm.startDeviceUsageExport = function () {
      $modal.open({
        template: require('modules/core/customerReports/deviceUsage/deviceUsageExport/devices-usage-export.html'),
        type: 'dialog',
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
          duration: now.diff(exportStarted).valueOf(),
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

    function getModelsForRange(start, end) {
      return DeviceUsageModelService.getModelsForRange(start, end, 'day', allDeviceCategories, apiToUse);
    }

    function modelsForRange(items) {
      _.each(DeviceUsageModelService.mapModelsIn(items), function (item) {
        if (!_.isEmpty(item.model) && item.model !== '*') {
          vm.modelOptions.push({
            value: item.model,
            label: item.model,
            isSelected: false,
          });
        }
      });
    }

    vm.modelsChanged = function modelsChanged() {
      DeviceUsageService.cancelAllRequests().then(doModelsChanged);
    };

    function doModelsChanged() {
      var models = _.map(DeviceUsageModelService.mapModelsOut(vm.modelsSelected), function (model) {
        return model.value;
      });
      getDataForSelectedRange(vm.timeSelected.value, models);
    }
  }
})();
