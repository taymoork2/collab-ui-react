(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('MeetingsGraphService', MeetingsGraphService);

  /* @ngInject */
  function MeetingsGraphService(CommonMetricsGraphService) {
    function getMeetingPieGraph(data, chart, id, noData, chartOptions) {
      if (_.isUndefined(chart) || (noData === true)) {
        var pieChart = CommonMetricsGraphService.getBasePieChart(data, chartOptions);
        chart = AmCharts.makeChart(id, pieChart);
      } else {
        chart.dataProvider = data.dataProvider;
      }
      chart.validateData();
      return chart;
    }

    function getMeetingDummyPieGraph(id) {
      var pieChart = CommonMetricsGraphService.getDummyPieChart();
      AmCharts.makeChart(id, pieChart);
      return;
    }

    return {
      getMeetingPieGraph: getMeetingPieGraph,
      getMeetingDummyPieGraph: getMeetingDummyPieGraph
    };
  }

})();
