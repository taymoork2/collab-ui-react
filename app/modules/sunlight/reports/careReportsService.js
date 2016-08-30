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
      valueAxes[0].title = $translate.instant('careReportsPage.tasks');

      var pattern = {
        "url": "line_pattern.png",
        "width": 14,
        "height": 14
      };

      var abandonedGraph = {
        title: $translate.instant('careReportsPage.abandoned'),
        lineColor: chartColors.colorLightRed,
        fillColors: chartColors.colorLightRedFill,
        valueField: 'numTasksAbandonedState',
        showBalloon: true,
        balloonFunction: balloonTextForTaskVolume
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
        valueField: 'numTasksHandledState'
      };

      var graphsPartial = (isToday) ? [handledGraph, assignedGraph, inQueueGraph, abandonedGraph] : [handledGraph, abandonedGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
              'createdTime', categoryAxis, valueAxes, exportReport);
    }

    function balloonTextForTaskVolume(graphDataItem, graph) {
      var numTasksAbandonedState = _.get(graphDataItem, 'dataContext.numTasksAbandonedState', 0);
      var numTasksQueuedState = _.get(graphDataItem, 'dataContext.numTasksQueuedState', 0);
      var numTasksAssignedState = _.get(graphDataItem, 'dataContext.numTasksAssignedState', 0);
      var numTasksHandledState = _.get(graphDataItem, 'dataContext.numTasksHandledState', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);

      var balloonTextToday = '<span class="care-graph-text">' + $translate.instant('careReportsPage.abandoned') + ' ' + numTasksAbandonedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.in-queue') + ' ' + numTasksQueuedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.assigned') + ' ' + numTasksAssignedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.handled') + ' ' + numTasksHandledState + '</span>';
      var balloonTextPast = '<span class="care-graph-text">' + $translate.instant('careReportsPage.abandoned') + ' ' + numTasksAbandonedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.handled') + ' ' + numTasksHandledState + '</span>';
      var balloonText = (today) ? balloonTextToday : balloonTextPast;
      return categoryRange + balloonText;
    }

    function balloonTextForTaskTime(graphDataItem, graph) {
      var convertToMillis = 60 * 1000;
      var avgTaskWaitTime = _.get(graphDataItem, 'dataContext.avgTaskWaitTime', 0);
      var avgTaskCloseTime = _.get(graphDataItem, 'dataContext.avgTaskCloseTime', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.avgQueueTime') + ' ' + millisToTime(avgTaskWaitTime * convertToMillis) + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.avgHandleTime') + ' ' + millisToTime(avgTaskCloseTime * convertToMillis) + '</span>';

      return categoryRange + balloonText;
    }

    function balloonTextForTaskAggregate(graphDataItem, graph) {
      var numPendingTasks = _.get(graphDataItem, 'dataContext.numPendingTasks', 0);
      var numWorkingTasks = _.get(graphDataItem, 'dataContext.numWorkingTasks', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.in-queue') + ' ' + numPendingTasks + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.assigned') + ' ' + numWorkingTasks + '</span>';

      return categoryRange + balloonText;
    }

    function balloonTextForAvgCsat(graphDataItem, graph) {
      var avgCsatScores = _.get(graphDataItem, 'dataContext.avgCsatScores', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.avgCsat') + ' ' + avgCsatScores + '</span><br>';

      return categoryRange + balloonText;
    }

    function millisToTime(durationInMillis) {
      var convertInSeconds = 1000;
      var convertInMinutes = 1000 * 60;
      var convertInHours = 1000 * 60 * 60;
      var radix = 10;
      var seconds = parseInt((durationInMillis / convertInSeconds) % 60, radix);
      var minutes = parseInt((durationInMillis / convertInMinutes) % 60, radix);
      var hours = parseInt((durationInMillis / convertInHours), radix);

      var timeFormat = "";
      if (hours != 0) {
        if (minutes != 0 || seconds != 0) {
          timeFormat = timeFormat + hours + "h ";
        } else {
          return hours + "h";
        }
      }
      if (minutes != 0) {
        if (seconds != 0) {
          timeFormat = timeFormat + minutes + "m ";
        } else {
          return timeFormat + minutes + "m";
        }
      }
      if (seconds != 0) {
        timeFormat = timeFormat + seconds + "s";
      }
      if (hours != 0 || minutes != 0 || seconds != 0) {
        return timeFormat;
      } else {
        return "0s";
      }
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
      valueAxes[0].title = $translate.instant('careReportsPage.taskTimeLabel');

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
        pattern: pattern,
        showBalloon: true,
        balloonFunction: balloonTextForTaskTime
      };
      var handleGraph = {
        title: $translate.instant('careReportsPage.handleTime'),
        lineColor: chartColors.colorLightGreen,
        fillColors: chartColors.colorLightGreenFill,
        valueField: 'avgTaskCloseTime'
      };

      var graphsPartial = [handleGraph, queueGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
              'createdTime', categoryAxis, valueAxes, exportReport);
    }

    function showTaskAggregateGraph(div, data, categoryAxisTitle) {
      var chartConfig = getTaskAggregateGraphConfig(data, categoryAxisTitle);
      return AmCharts.makeChart(div, chartConfig);
    }

    function showTaskAggregateDummy(div, data, categoryAxisTitle) {
      var chartConfig = getTaskAggregateGraphConfig(data, categoryAxisTitle);

      dummifyGraph(chartConfig);

      return AmCharts.makeChart(div, chartConfig);
    }

    function getTaskAggregateGraphConfig(data, categoryAxisTitle) {
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = CareReportsGraphService.getBaseVariable('legend');

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = $translate.instant('careReportsPage.tasks');

      var pattern = {
        "url": "line_pattern.png",
        "width": 14,
        "height": 14
      };

      var inQueueGraph = {
        title: $translate.instant('careReportsPage.in-queue'),
        lineColor: chartColors.colorLightYellow,
        fillColors: chartColors.colorLightYellow,
        valueField: 'numPendingTasks',
        dashLength: 2,
        fillAlphas: 1,
        pattern: pattern,
        showBalloon: true,
        balloonFunction: balloonTextForTaskAggregate
      };

      var assignedGraph = {
        title: $translate.instant('careReportsPage.assigned'),
        lineColor: chartColors.colorLightYellow,
        fillColors: chartColors.colorLightYellowFill,
        valueField: 'numWorkingTasks',
      };

      var graphsPartial = [assignedGraph, inQueueGraph];
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
      showAverageCsatDummy: showAverageCsatDummy,
      showTaskAggregateGraph: showTaskAggregateGraph,
      showTaskAggregateDummy: showTaskAggregateDummy,
      getTaskIncomingGraphConfig: getTaskIncomingGraphConfig,
      getTaskTimeGraphConfig: getTaskTimeGraphConfig,
      getAverageCsatGraphConfig: getAverageCsatGraphConfig,
      getTaskAggregateGraphConfig: getTaskAggregateGraphConfig
    };

    return service;
  }
})();
