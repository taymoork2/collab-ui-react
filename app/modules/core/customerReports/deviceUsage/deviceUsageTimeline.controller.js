(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageTimelineCtrl', DeviceUsageTimelineCtrl);

  /* @ngInject */
  function DeviceUsageTimelineCtrl($log, $state, $scope, DeviceUsageTimelineService, deviceUsageFeatureToggle) {
    var vm = this;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    vm.additionalInfo = false;

    //$scope.chartData = UsageByModeChartService.dataProviderTrend('week', 1, 'day');
    DeviceUsageTimelineService.getData('week', 1, 'day').then(function (data) {
      var chart = DeviceUsageTimelineService.getLineChart();
      chart.listeners = [
      { event: 'rollOverGraphItem', method: rollOverGraphItem },
      { event: 'rollOutGraphItem', method: rollOutGraphItem },
      { event: 'clickGraphItem', method: clickGraphItem }
      ];
      chart.dataProvider = data;
      var amChart = AmCharts.makeChart('device-usage-timeline-chart', chart);
      _.each(amChart.graphs, function (graph) {
        graph.balloonFunction = renderBalloon;
      });

    });

    function rollOverGraphItem(event) {
      $log.info('rollOverGraph', event);
      vm.additionalInfo = true;
      vm.dayData = event.item.dataContext;
      $scope.$apply();
    }

    function rollOutGraphItem(event) {
      $log.info('rollOutGraph', event);
      vm.additionalInfo = false;
      $scope.$apply();
    }

    function clickGraphItem(event) {
      $log.info('rollOutGraph', event);
    }

    function renderBalloon(graphDataItem) {
      var text = '<div><h5>Video Duration: ' + graphDataItem.dataContext.video + '</h5>';
      // text = text + '<hr/><span>Whiteboarding count: ' + graphDataItem.dataContext.wbCount + '</span>';
      // text = text + '<hr/><span>Sharing count: ' + graphDataItem.dataContext.sharedCount + '</span>';
      // text = text + '<hr/><span>Paired count: ' + graphDataItem.dataContext.pairedCount + '</span>';
      text = text + '</div>';
      return text;
    }

  }

})();
