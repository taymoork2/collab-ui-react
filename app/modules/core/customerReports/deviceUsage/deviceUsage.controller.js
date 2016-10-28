(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageCtrl', DeviceUsageCtrl);

  /* @ngInject */
  function DeviceUsageCtrl($log, $state, $scope, DeviceUsageTotalService, Notification, deviceUsageFeatureToggle, DeviceUsageCommonService, DeviceUsageDistributionReportService) {
    var vm = this;
    var amChart;
    var apiToUse = 'mock';

    vm.leastUsedDevices = [];
    vm.mostUsedDevices = [];
    // TODO: Replace by range selector...
    var now = new moment().format("YYYY-MM-DD");
    var from = moment(now).subtract(30, "days").format("YYYY-MM-DD");
    var to = moment(now).subtract(23, "days").format("YYYY-MM-DD");


    vm.loading = true;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    fillInHighScore();

    $scope.$on('time-range-changed', function (event, timeSelected) {
      switch (timeSelected.value) {
        case 0:
          loadLastWeek();
          break;
        case 1:
          loadLastMonth();
          break;
        case 2:
          loadLast3Months();
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
      //{ event: 'clickGraphItem', method: clickGraphItem }
      ];

      amChart = AmCharts.makeChart('device-usage-total-chart', chart);
      _.each(amChart.graphs, function (graph) {
        graph.balloonFunction = renderBalloon;
      });
      loadInitData();
    }

    function loadChartData(data) {
      amChart.dataProvider = data;
      amChart.validateData();
      vm.showDevices = false;
    }

    function loadInitData() {
      switch (DeviceUsageCommonService.getTimeSelected()) {
        case 0:
          DeviceUsageTotalService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        case 1:
          DeviceUsageTotalService.getDataForLastMonth(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        case 2:
          DeviceUsageTotalService.getDataForLastMonths(3, 'day', ['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        default:
          DeviceUsageTotalService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
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

    function loadLastWeek() {
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
      }, handleReject);
    }

    function loadLastMonth() {
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastMonth(['ce', 'sparkboard'], apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
      }, handleReject);
    }

    function loadLast3Months() {
      vm.loading = true;
      DeviceUsageTotalService.getDataForLastMonths(3, 'day', ['ce', 'sparkboard'], apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
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

    // function clickGraphItem(event) {
    //   if (lastDataPointIndex === event.index) {
    //     vm.showDevices = !vm.showDevices;
    //   } else {
    //     lastDataPointIndex = event.index;
    //     vm.devices = event.item.dataContext.devices;
    //     vm.dateForDevices = event.item.dataContext.time;
    //     vm.showDevices = true;
    //   }
    //   $scope.$apply();
    // }

    function renderBalloon(graphDataItem) {
      var text = '<div><h5>Call Duration: ' + graphDataItem.dataContext.totalDuration + '</h5>';
      text = text + 'Call Count:  ' + graphDataItem.dataContext.callCount + ' <br/> ';
      text = text + 'Paired Count: ' + graphDataItem.dataContext.pairedCount + '<br/>';
      //text = text + 'Devices: ' + graphDataItem.dataContext.devices.length + '</div>';
      return text;
    }

    function fillInHighScore() {
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
        return hours + "h :" + pad(minutes, 2) + "m";
      } else if (hours >= 1) {
        return pad(hours, 2) + "h " + pad(minutes, 2) + "m";
      } else {
        return "    " + pad(minutes, 2) + "m " + pad(seconds, 2) + "s";
      }
    }

  }

})();
