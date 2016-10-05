(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageTimelineCtrl', DeviceUsageTimelineCtrl);

  /* @ngInject */
  function DeviceUsageTimelineCtrl($state, $scope, DeviceUsageTimelineService, deviceUsageFeatureToggle) {
    var vm = this;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    vm.additionalInfo = false;

    DeviceUsageTimelineService.getDataForLastWeek('mock').then(function (data) {
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
