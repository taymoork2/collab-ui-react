(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageTimelineCtrl', DeviceUsageTimelineCtrl);

  /* @ngInject */
  function DeviceUsageTimelineCtrl($state, $scope, DeviceUsageTimelineService, deviceUsageFeatureToggle) {
    var vm = this;
    var amChart;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    vm.dateRanges = [{
      label: 'Last Week',
      value: 'last_week',
      name: 'dateRange',
      id: 'week'
    }, {
      label: 'Last Month',
      value: 'last_month',
      name: 'dateRange',
      id: 'month'
    }, {
      label: 'Last 3 Months',
      value: 'last_3_months',
      name: 'dateRange',
      id: 'last_3_months'
    }];

    vm.dateRange = 'last_week';

    vm.additionalInfo = false;

    vm.rangeChange = function () {
      switch (vm.dateRange) {
        case 'last_week':
          loadLastWeek();
          break;
        case 'last_month':
          loadLastMonth();
          break;
        case 'last_3_months':
          loadLast3Months();
          break;
        default:
          loadLastWeek();
      }
    };

    init();

    function init() {
      DeviceUsageTimelineService.getDataForLastWeek('mock').then(function (data) {
        var chart = DeviceUsageTimelineService.getLineChart();
        chart.listeners = [
        { event: 'rollOverGraphItem', method: rollOverGraphItem },
        { event: 'rollOutGraphItem', method: rollOutGraphItem },
        { event: 'clickGraphItem', method: clickGraphItem }
        ];
        chart.dataProvider = data;
        amChart = AmCharts.makeChart('device-usage-timeline-chart', chart);
        _.each(amChart.graphs, function (graph) {
          graph.balloonFunction = renderBalloon;
        });

      });
    }

    function loadLastWeek() {
      DeviceUsageTimelineService.getDataForLastWeek('mock').then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
      });
    }

    function loadLastMonth() {
      DeviceUsageTimelineService.getDataForLastMonth('mock').then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
      });
    }

    function loadLast3Months() {
      DeviceUsageTimelineService.getDataForLastMonths(3, 'week', 'mock').then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
      });
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

    function clickGraphItem() {
    }

    function renderBalloon(graphDataItem) {
      var text = '<div><h5>Video Duration: ' + graphDataItem.dataContext.video + '</h5></div>';
      return text;
    }

  }

})();
