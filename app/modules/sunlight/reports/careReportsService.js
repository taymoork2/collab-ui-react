(function () {
  'use strict';

  angular.module('Sunlight')
    .service('CareReportsService', CareReportsService);

  /* @ngInject */
  function CareReportsService($translate, CareReportsGraphService, chartColors) {

    var today = true;

    function dummifyGraph(chartConfig) {
      var dummyColors = [chartColors.dummyGrayFillDarker, chartColors.dummyGrayFillDark];
      if (today) {
        dummyColors = [chartColors.dummyGrayFillDarker, chartColors.dummyGrayFillDark, chartColors.dummyGrayFillLighter, chartColors.dummyGrayFillLight];
      }

      var dummyGraphs = _.map(chartConfig.graphs, function (graph, i) {
        return _.assign(graph, {
          fillAlphas: 1,
          showBalloon: false,
          lineColor: dummyColors[i],
          fillColors: dummyColors[i],
          pattern: ''
        });
      });
      chartConfig.export.enabled = false;
      chartConfig.graphs = dummyGraphs;
      chartConfig.chartCursor.cursorAlpha = 0;
      return chartConfig;
    }

    function showTaskIncomingGraph(div, data, categoryAxisTitle, isToday) {
      var chartConfig = getTaskIncomingGraphConfig(data, categoryAxisTitle, isToday);
      return AmCharts.makeChart(div, chartConfig);
    }

    function showTaskIncomingDummy(div, data, categoryAxisTitle, isToday) {
      var chartConfig = getTaskIncomingGraphConfig(data, categoryAxisTitle, isToday);

      dummifyGraph(chartConfig);

      return AmCharts.makeChart(div, chartConfig);
    }

    function getTaskIncomingGraphConfig(data, categoryAxisTitle, isToday) {
      today = isToday;
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = CareReportsGraphService.getBaseVariable('legend');
      legend.equalWidths = !isToday;

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = 'Tasks';

      var pattern = {
        "url": "line_pattern.png",
        "width": 14,
        "height": 14
      };

      var abandonedGraph = {
        title: $translate.instant('careReportsPage.abandoned'),
        lineColor: chartColors.colorLightRed,
        fillColors: chartColors.colorLightRedFill,
        valueField: 'numTasksAbandonedState'
      };
      var inQueueGraph = {
        title: $translate.instant('careReportsPage.in-queue'),
        lineColor: chartColors.colorLightYellow,
        valueField: 'numTasksQueuedState',
        pattern: pattern,
        fillAlphas: 1,
        dashLength: 2
      };
      var assignedGraph = {
        title: $translate.instant('careReportsPage.assigned'),
        lineColor: chartColors.colorLightYellow,
        fillColors: chartColors.colorLightYellowFill,
        valueField: 'numTasksAssignedState'
      };
      var handledGraph = {
        title: $translate.instant('careReportsPage.handled'),
        lineColor: chartColors.colorLightGreen,
        valueField: 'numTasksHandledState',
        showBalloon: true,
        balloonFunction: balloonTextForTaskVolume
      };

      var graphsPartial = (isToday) ? [handledGraph, assignedGraph, inQueueGraph, abandonedGraph] : [handledGraph, abandonedGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
              'createdTime', categoryAxis, valueAxes, exportReport);
    }

    function balloonTextForTaskVolume(graphDataItem, graph) {
      //var value = graphDataItem.values.value;
      var numTasksAbandonedState = graphDataItem.dataContext.numTasksAbandonedState;
      var numTasksQueuedState = graphDataItem.dataContext.numTasksQueuedState;
      var numTasksAssignedState = graphDataItem.dataContext.numTasksAssignedState;
      var numTasksHandledState = graphDataItem.dataContext.numTasksHandledState;
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);

      var balloonTextToday = '<span class="care-graph-text">' + $translate.instant('careReportsPage.abandoned') + numTasksAbandonedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.in-queue') + numTasksQueuedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.assigned') + numTasksAssignedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.handled') + numTasksHandledState + '</span>';
      var balloonTextPast = '<span class="care-graph-text">' + $translate.instant('careReportsPage.abandoned') + numTasksAbandonedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.handled') + numTasksHandledState + '</span>';
      var balloonText = (today) ? balloonTextToday : balloonTextPast;
      return categoryRange + balloonText;
    }

    function balloonTextForTaskTime(graphDataItem, graph) {
      var avgTaskWaitTime = graphDataItem.dataContext.avgTaskWaitTime;
      var avgTaskCloseTime = graphDataItem.dataContext.avgTaskCloseTime;
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.avgQueueTime') + avgTaskWaitTime + '</span><br><span class="care-graph-text">Avg Handle Time ' + $translate.instant('careReportsPage.avgHandleTime') + avgTaskCloseTime + '</span>';

      return categoryRange + balloonText;
    }

    function balloonTextForAvgCsat(graphDataItem, graph) {
      var avgCsatScores = graphDataItem.dataContext.avgCsatScores;
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.avgCsat') + avgCsatScores + '</span><br>';

      return categoryRange + balloonText;
    }

    function setCategoryRange(categoryAxisTitle, category) {
      var categoryRange = '';
      if (categoryAxisTitle === 'Hours') {
        var start = moment(category, 'HH:mm').subtract(1, 'hours').format('HH:mm');
        categoryRange = '<span>' + start + ' - ' + category + '</span><br>';
      }

      return categoryRange;
    }

    function showTaskTimeGraph(div, data, categoryAxisTitle) {
      var chartConfig = getTaskTimeGraphConfig(data, categoryAxisTitle);
      return AmCharts.makeChart(div, chartConfig);
    }

    function showTaskTimeDummy(div, data, categoryAxisTitle) {
      var chartConfig = getTaskTimeGraphConfig(data, categoryAxisTitle);

      dummifyGraph(chartConfig);

      return AmCharts.makeChart(div, chartConfig);
    }

    function getTaskTimeGraphConfig(data, categoryAxisTitle) {
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = CareReportsGraphService.getBaseVariable('legend');

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = 'Time in Minutes';

      var pattern = {
        "url": "line_pattern.png",
        "width": 14,
        "height": 14
      };

      var queueGraph = {
        title: $translate.instant('careReportsPage.queueTime'),
        lineColor: chartColors.colorLightYellow,
        fillColors: chartColors.colorLightYellow,
        valueField: 'avgTaskWaitTime',
        dashLength: 2,
        fillAlphas: 1,
        pattern: pattern
      };
      var handleGraph = {
        title: $translate.instant('careReportsPage.handleTime'),
        lineColor: chartColors.colorLightGreen,
        fillColors: chartColors.colorLightGreenFill,
        valueField: 'avgTaskCloseTime',
        showBalloon: true,
        balloonFunction: balloonTextForTaskTime
      };

      var graphsPartial = [handleGraph, queueGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
              'createdTime', categoryAxis, valueAxes, exportReport);
    }

    function showAverageCsatGraph(div, data, categoryAxisTitle) {
      var chartConfig = getAverageCsatGraphConfig(data, categoryAxisTitle);
      return AmCharts.makeChart(div, chartConfig);
    }

    function showAverageCsatDummy(div, data, categoryAxisTitle) {
      var chartConfig = getAverageCsatGraphConfig(data, categoryAxisTitle);

      dummifyGraph(chartConfig);

      return AmCharts.makeChart(div, chartConfig);
    }

    function getAverageCsatGraphConfig(data, categoryAxisTitle) {
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = CareReportsGraphService.getBaseVariable('legend');

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = $translate.instant('careReportsPage.csatRating');

      var csatGraph = {
        title: $translate.instant('careReportsPage.averageCsat'),
        lineColor: chartColors.colorLightGreen,
        fillColors: chartColors.brandWhite,
        valueField: 'avgCsatScores',
        showBalloon: true,
        balloonFunction: balloonTextForAvgCsat,
        bullet: 'circle',
        bulletAlpha: 0,
        bulletBorderAlpha: 0,
        bulletSize: 2 
      };
      var graphsPartial = [csatGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
              'createdTime', categoryAxis, valueAxes, exportReport);
    }

    var service = {
      showTaskIncomingGraph: showTaskIncomingGraph,
      showTaskIncomingDummy: showTaskIncomingDummy,
      showTaskTimeGraph: showTaskTimeGraph,
      showTaskTimeDummy: showTaskTimeDummy,
      showAverageCsatGraph: showAverageCsatGraph,
      showAverageCsatDummy: showAverageCsatDummy
    };

    return service;
  }
})();
