(function () {
  'use strict';

  angular.module('Sunlight')
    .service('CareReportsService', CareReportsService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function CareReportsService($translate, CareReportsGraphService) {
    var today = true;

    function dummifyGraph(chartConfig) {
      var dummyColors = [ChartColors.grayLightOne, ChartColors.grayLightTwo];
      if (today) {
        dummyColors = [ChartColors.grayLightOne, ChartColors.grayLightTwo, ChartColors.grayLightThree, ChartColors.grayLightFour];
      }

      var dummyGraphs = _.map(chartConfig.graphs, function (graph, i) {
        return _.assign(graph, {
          fillAlphas: 1,
          showBalloon: false,
          lineColor: dummyColors[i],
          fillColors: dummyColors[i],
          pattern: '',
        });
      });
      chartConfig.export.enabled = false;
      chartConfig.graphs = dummyGraphs;
      chartConfig.chartCursor.cursorAlpha = 0;
      return chartConfig;
    }

    function showTaskIncomingGraph(taskIncomingdiv, taskIncomingBreakdowndiv, data, categoryAxisTitle, title) {
      var incomingChartConfig = getTaskIncomingGraphConfig(data, categoryAxisTitle, title, false, 'abandoned',
        'handled', 'numTasksAbandonedState', 'numTasksHandledState', ChartColors.alertsBase);
      var incomingBreakdownChartConfig = getTaskIncomingGraphConfig(data, categoryAxisTitle, title, true, 'chatWithVideo',
        'chat', 'numWebcallTasksHandled', 'numChatTasksHandled', ChartColors.primaryBase);

      return [AmCharts.makeChart(taskIncomingdiv, incomingChartConfig),
        AmCharts.makeChart(taskIncomingBreakdowndiv, incomingBreakdownChartConfig)];
    }

    function showTaskIncomingDummy(taskIncomingdiv, taskIncomingBreakdowndiv, data, categoryAxisTitle, title) {
      var incomingChartConfig = getTaskIncomingGraphConfig(data, categoryAxisTitle, title, false, 'abandoned',
        'handled', 'numTasksAbandonedState', 'numTasksHandledState');
      var incomingBreakdownChartConfig = getTaskIncomingGraphConfig(data, categoryAxisTitle, title, true,
        'chatWithVideo', 'chat', 'numTasksAbandonedState', 'numTasksHandledState');

      dummifyGraph(incomingChartConfig);
      dummifyGraph(incomingBreakdownChartConfig);

      return [AmCharts.makeChart(taskIncomingdiv, incomingChartConfig),
        AmCharts.makeChart(taskIncomingBreakdowndiv, incomingBreakdownChartConfig)];
    }

    function getTaskIncomingGraphConfig(data, categoryAxisTitle, title, isBreakdown, upperGraphTitle, lowerGraphTitle,
      upperGraphValue, lowerGraphValue, lineColor) {
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var titles = CareReportsGraphService.getBaseVariable('title');
      if (!_.isUndefined(title)) {
        titles[0].text = title;
        titles[0].enabled = true;
      }

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = CareReportsGraphService.getBaseVariable('legend');
      legend.equalWidths = false;

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = $translate.instant('careReportsPage.tasks');

      var upperGraph = {
        title: $translate.instant('careReportsPage.' + upperGraphTitle),
        lineColor: lineColor,
        valueField: upperGraphValue,
        showBalloon: true,
        balloonFunction: isBreakdown ? balloonTextForTaskVolumeBreakdown : balloonTextForTaskVolume,
      };

      var lowerGraph = {
        title: $translate.instant('careReportsPage.' + lowerGraphTitle),
        lineColor: ChartColors.ctaBase,
        valueField: lowerGraphValue,
      };

      var graphsPartial = [lowerGraph, upperGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
        'createdTime', categoryAxis, valueAxes, exportReport, titles);
    }

    function showTaskOfferedGraph(div, data, categoryAxisTitle, title) {
      var chartConfig = getTaskOfferedGraphConfig(data, categoryAxisTitle, title);
      return AmCharts.makeChart(div, chartConfig);
    }

    function showTaskOfferedDummy(div, data, categoryAxisTitle, title) {
      var chartConfig = getTaskOfferedGraphConfig(data, categoryAxisTitle, title);

      dummifyGraph(chartConfig);

      return AmCharts.makeChart(div, chartConfig);
    }

    function getTaskOfferedGraphConfig(data, categoryAxisTitle, title) {
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var titles = CareReportsGraphService.getBaseVariable('title');
      if (!_.isUndefined(title)) {
        titles[0].text = title;
        titles[0].enabled = true;
      }

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = CareReportsGraphService.getBaseVariable('legend');
      legend.equalWidths = false;

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = $translate.instant('careReportsPage.percentage');
      valueAxes[0].stackType = '100%';

      var percentMissedGraph = {
        title: $translate.instant('careReportsPage.missed'),
        lineColor: ChartColors.alertsBase,
        fillColors: ChartColors.colorLightRedFill,
        valueField: 'tasksMissed',
        showBalloon: true,
        balloonFunction: balloonTextForTaskOffered,
      };

      var percentAcceptedGraph = {
        title: $translate.instant('careReportsPage.accepted'),
        lineColor: ChartColors.ctaBase,
        valueField: 'tasksAccepted',
      };

      var graphsPartial = [percentAcceptedGraph, percentMissedGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
        'createdTime', categoryAxis, valueAxes, exportReport, titles);
    }

    function balloonTextForTaskVolume(graphDataItem, graph) {
      var numTasksAbandonedState = _.get(graphDataItem, 'dataContext.numTasksAbandonedState', 0);
      var numTasksHandledState = _.get(graphDataItem, 'dataContext.numTasksHandledState', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.abandoned') + ': ' + numTasksAbandonedState + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.handled') + ': ' + numTasksHandledState + '</span>';

      return categoryRange + balloonText;
    }

    function balloonTextForTaskVolumeBreakdown(graphDataItem, graph) {
      var numChatTasksHandled = _.get(graphDataItem, 'dataContext.numChatTasksHandled', 0);
      var numWebcallTasksHandled = _.get(graphDataItem, 'dataContext.numWebcallTasksHandled', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.chat') + ': ' + numChatTasksHandled + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.chatWithVideo') + ': ' + numWebcallTasksHandled + '</span>';

      return categoryRange + balloonText;
    }

    function balloonTextForTaskOffered(graphDataItem, graph) {
      var tasksOffered = _.get(graphDataItem, 'dataContext.tasksOffered', 0);
      var tasksMissed = _.get(graphDataItem, 'dataContext.tasksMissed', 0);
      var tasksAccepted = _.get(graphDataItem, 'dataContext.tasksAccepted', 0);
      var percentageTasksAccepted = tasksOffered > 0 ? Math.round((tasksAccepted / tasksOffered) * 100) : 0;
      var percentageTasksMissed = tasksOffered > 0 ? Math.min(Math.round((tasksMissed / tasksOffered) * 100), 100) : 0;
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.accepted') + ': ' + percentageTasksAccepted + '%' + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.missed') + ': ' + percentageTasksMissed + '%' + '</span>';
      return categoryRange + balloonText;
    }

    function balloonTextForTaskTime(graphDataItem, graph) {
      var convertToMillis = 60 * 1000;
      var avgTaskWaitTime = _.get(graphDataItem, 'dataContext.avgTaskWaitTime', 0);
      var avgTaskCloseTime = _.get(graphDataItem, 'dataContext.avgTaskCloseTime', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.avgQueueTime') + ': ' + millisToTime(avgTaskWaitTime * convertToMillis) + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.avgHandleTime') + ': ' + millisToTime(avgTaskCloseTime * convertToMillis) + '</span>';

      return categoryRange + balloonText;
    }

    function balloonTextForTaskTimeBreakdown(graphDataItem, graph) {
      var convertToMillis = 60 * 1000;
      var avgChatTaskCloseTime = _.get(graphDataItem, 'dataContext.avgChatTaskCloseTime', 0);
      var avgWebcallTaskCloseTime = _.get(graphDataItem, 'dataContext.avgWebcallTaskCloseTime', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.chat') + ': ' + millisToTime(avgChatTaskCloseTime * convertToMillis) + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.chatWithVideo') + ': ' + millisToTime(avgWebcallTaskCloseTime * convertToMillis) + '</span>';

      return categoryRange + balloonText;
    }

    function balloonTextForTaskAggregate(graphDataItem, graph) {
      var numPendingTasks = _.get(graphDataItem, 'dataContext.numPendingTasks', 0);
      var numWorkingTasks = _.get(graphDataItem, 'dataContext.numWorkingTasks', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.in-queue') + ': ' + numPendingTasks + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.assigned') + ': ' + numWorkingTasks + '</span>';

      return categoryRange + balloonText;
    }

    function balloonTextForAvgCsat(graphDataItem, graph) {
      var avgCsatScores = _.get(graphDataItem, 'dataContext.avgCsatScores', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.avgCsat') + ': ' + avgCsatScores + '</span><br>';

      return categoryRange + balloonText;
    }

    function balloonTextForAvgCsatBreakdown(graphDataItem, graph) {
      var avgChatCsatScores = _.get(graphDataItem, 'dataContext.avgChatCsatScores', 0);
      var avgWebcallCsatScores = _.get(graphDataItem, 'dataContext.avgWebcallCsatScores', 0);
      var categoryRange = setCategoryRange(graph.categoryAxis.title, graphDataItem.category);
      var balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.avgCsatChat') + ': ' + avgChatCsatScores + '</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.avgCsatWebcall') + ': ' + avgWebcallCsatScores + '</span>';

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

      var timeFormat = '';
      if (hours != 0) {
        timeFormat = hours + 'h ';
      }
      if (minutes != 0) {
        timeFormat = timeFormat + minutes + 'm ';
      }
      if (seconds != 0) {
        timeFormat = timeFormat + seconds + 's';
      }
      if (timeFormat) {
        return timeFormat;
      } else {
        return '0s';
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

    function showTaskTimeGraph(taskTimeDiv, taskTimeBreakdownDiv, data, categoryAxisTitle, title) {
      var taskTimeChartConfig = getTaskTimeGraphConfig(data, categoryAxisTitle, title, false, 'queueTime', 'handleTime',
        'avgTaskWaitTime', 'avgTaskCloseTime', ChartColors.attentionBase);
      var taskTimeBreakdownChartConfig = getTaskTimeGraphConfig(data, categoryAxisTitle, title, true, 'chatWithVideo', 'chat',
        'avgWebcallTaskCloseTime', 'avgChatTaskCloseTime', ChartColors.primaryBase);

      return [AmCharts.makeChart(taskTimeDiv, taskTimeChartConfig),
        AmCharts.makeChart(taskTimeBreakdownDiv, taskTimeBreakdownChartConfig)];
    }

    function showTaskTimeDummy(taskTimeDiv, taskTimeBreakdownDiv, data, categoryAxisTitle, title) {
      var taskTimeChartConfig = getTaskTimeGraphConfig(data, categoryAxisTitle, title, false, 'queueTime', 'handleTime',
        'avgTaskWaitTime', 'avgTaskCloseTime');
      var taskTimeBreakdownChartConfig = getTaskTimeGraphConfig(data, categoryAxisTitle, title, true, 'chatWithVideo', 'chat',
        'avgTaskWaitTime', 'avgTaskCloseTime');

      dummifyGraph(taskTimeChartConfig);
      dummifyGraph(taskTimeBreakdownChartConfig);

      return [AmCharts.makeChart(taskTimeDiv, taskTimeChartConfig),
        AmCharts.makeChart(taskTimeBreakdownDiv, taskTimeBreakdownChartConfig)];
    }

    function getTaskTimeGraphConfig(data, categoryAxisTitle, title, isBreakdown, upperGraphTitle, lowerGraphTitle,
      upperGraphValue, lowerGraphValue, lineColor) {
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var titles = CareReportsGraphService.getBaseVariable('title');
      if (!_.isUndefined(title)) {
        titles[0].text = title;
        titles[0].enabled = true;
      }

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = CareReportsGraphService.getBaseVariable('legend');
      legend.equalWidths = false;

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = $translate.instant('careReportsPage.taskTimeLabel');

      var pattern = {
        url: 'line_pattern.png',
        width: 14,
        height: 14,
      };

      var upperGraph = isBreakdown ? {
        title: $translate.instant('careReportsPage.' + upperGraphTitle),
        lineColor: lineColor,
        valueField: upperGraphValue,
        showBalloon: true,
        balloonFunction: balloonTextForTaskTimeBreakdown,
      } : {
        title: $translate.instant('careReportsPage.' + upperGraphTitle),
        lineColor: lineColor,
        valueField: upperGraphValue,
        dashLength: 2,
        fillAlphas: 1,
        pattern: pattern,
        showBalloon: true,
        balloonFunction: balloonTextForTaskTime,
      };

      var lowerGraph = {
        title: $translate.instant('careReportsPage.' + lowerGraphTitle),
        lineColor: ChartColors.ctaBase,
        valueField: lowerGraphValue,
      };

      var graphsPartial = [lowerGraph, upperGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
        'createdTime', categoryAxis, valueAxes, exportReport, titles);
    }

    function showTaskAggregateGraph(taskAggregateDiv, data, categoryAxisTitle, title) {
      var taskAggregateChartConfig = getTaskAggregateGraphConfig(data, categoryAxisTitle, title, 'in-queue',
        'assigned', 'numPendingTasks', 'numWorkingTasks', ChartColors.attentionBase, ChartColors.attentionBase);
      return AmCharts.makeChart(taskAggregateDiv, taskAggregateChartConfig);
    }

    function showTaskAggregateDummy(taskAggregateDiv, data, categoryAxisTitle, title) {
      var taskAggregateChartConfig = getTaskAggregateGraphConfig(data, categoryAxisTitle, title,
        'in-queue', 'assigned', 'numPendingTasks', 'numWorkingTasks');
      dummifyGraph(taskAggregateChartConfig);
      return AmCharts.makeChart(taskAggregateDiv, taskAggregateChartConfig);
    }

    function getTaskAggregateGraphConfig(data, categoryAxisTitle, title, upperGraphTitle, lowerGraphTitle,
      upperGraphValue, lowerGraphValue, upperGraphLineColor, lowerGraphLineColor) {
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var titles = CareReportsGraphService.getBaseVariable('title');
      if (!_.isUndefined(title)) {
        titles[0].text = title;
        titles[0].enabled = true;
      }

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = CareReportsGraphService.getBaseVariable('legend');
      legend.equalWidths = false;

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = $translate.instant('careReportsPage.tasks');

      var pattern = {
        url: 'line_pattern.png',
        width: 14,
        height: 14,
      };

      var upperGraph = {
        title: $translate.instant('careReportsPage.' + upperGraphTitle),
        lineColor: upperGraphLineColor,
        valueField: upperGraphValue,
        dashLength: 2,
        fillAlphas: 1,
        pattern: pattern,
        showBalloon: true,
        balloonFunction: balloonTextForTaskAggregate,
      };

      var lowerGraph = {
        title: $translate.instant('careReportsPage.' + lowerGraphTitle),
        lineColor: lowerGraphLineColor,
        valueField: lowerGraphValue,
      };

      var graphsPartial = [lowerGraph, upperGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
        'createdTime', categoryAxis, valueAxes, exportReport, titles);
    }

    function showAverageCsatGraph(avgCsatDiv, avgCsatBreakdownDiv, data, categoryAxisTitle, title) {
      var avgCsatChartConfig = getAverageCsatGraphConfig(data, categoryAxisTitle, title, false, 'averageCsat', '',
        'avgCsatScores', '', ChartColors.ctaBase);
      var avgCsatBreakdownChartConfig = getAverageCsatGraphConfig(data, categoryAxisTitle, title, true, 'chatWithVideo',
        'chat', 'avgWebcallCsatScores', 'avgChatCsatScores', ChartColors.primaryBase);

      return [AmCharts.makeChart(avgCsatDiv, avgCsatChartConfig),
        AmCharts.makeChart(avgCsatBreakdownDiv, avgCsatBreakdownChartConfig)];
    }

    function showAverageCsatDummy(avgCsatDiv, avgCsatBreakdownDiv, data, categoryAxisTitle, title) {
      var avgCsatChartConfig = getAverageCsatGraphConfig(data, categoryAxisTitle, title, false, 'averageCsat', '',
        'avgCsatScores');
      var avgCsatBreakdownChartConfig = getAverageCsatGraphConfig(data, categoryAxisTitle, title, true,
        'chatWithVideo', 'chat', 'avgWebcallCsatScores', 'avgChatCsatScores');

      dummifyGraph(avgCsatChartConfig);
      dummifyGraph(avgCsatBreakdownChartConfig);

      return [AmCharts.makeChart(avgCsatDiv, avgCsatChartConfig),
        AmCharts.makeChart(avgCsatBreakdownDiv, avgCsatBreakdownChartConfig)];
    }

    function getAverageCsatGraphConfig(data, categoryAxisTitle, title, isBreakdown, upperGraphTitle, lowerGraphTitle,
      upperGraphValue, lowerGraphValue, lineColor) {
      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = true;

      var titles = CareReportsGraphService.getBaseVariable('title');
      if (!_.isUndefined(title)) {
        titles[0].text = title;
        titles[0].enabled = true;
      }

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = 1;

      var categoryAxis = CareReportsGraphService.getBaseVariable('axis');
      categoryAxis.startOnAxis = true;
      categoryAxis.title = categoryAxisTitle;

      var legend = isBreakdown ? CareReportsGraphService.getBaseVariable('legend') : '';
      if (legend) {
        legend.equalWidths = false;
      }

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = $translate.instant('careReportsPage.csatRating');
      valueAxes[0].maximum = 5;
      valueAxes[0].stackType = 'none';

      var upperGraph = isBreakdown ? {
        title: $translate.instant('careReportsPage.' + upperGraphTitle),
        lineColor: lineColor,
        fillColors: ChartColors.brandWhite,
        valueField: upperGraphValue,
      } : {
        title: $translate.instant('careReportsPage.' + upperGraphTitle),
        lineColor: lineColor,
        fillColors: ChartColors.brandWhite,
        valueField: upperGraphValue,
        showBalloon: true,
        balloonFunction: balloonTextForAvgCsat,
        bullet: 'circle',
        bulletAlpha: 0,
        bulletBorderAlpha: 0,
        bulletSize: 2,
      };

      var lowerGraph = {};
      if (isBreakdown) {
        lowerGraph = {
          title: $translate.instant('careReportsPage.' + lowerGraphTitle),
          lineColor: ChartColors.ctaBase,
          fillColors: ChartColors.brandWhite,
          valueField: lowerGraphValue,
          showBalloon: true,
          balloonFunction: balloonTextForAvgCsatBreakdown,
        };
      }

      var graphsPartial = isBreakdown ? [lowerGraph, upperGraph] : [upperGraph];
      var graphs = _.map(graphsPartial, function (graph) {
        return _.defaults(graph, CareReportsGraphService.getBaseVariable('graph'));
      });

      return CareReportsGraphService.buildChartConfig(data, legend, graphs, chartCursor,
        'createdTime', categoryAxis, valueAxes, exportReport, titles);
    }

    function roundCSATAvg(value) {
      return Math.round(value * 100) / 100;
    }

    function getWebcallDataStats(dataArr) {
      var webcallData = dataArr.filter(function (data) { return data.mediaType === 'webcall'; });
      var webcallStats = {
        isNumHandledTaskPresent: false,
        isAvgHandleTimePresent: false,
        isAvgCSATPresent: false,
      };

      webcallData.forEach(function (data) {
        webcallStats.isNumHandledTaskPresent = webcallStats.isNumHandledTaskPresent || Boolean(data.numWebcallTasksHandled);
        webcallStats.isAvgHandleTimePresent = webcallStats.isAvgHandleTimePresent || Boolean(data.avgWebcallTaskCloseTime);
        webcallStats.isAvgCSATPresent = webcallStats.isAvgCSATPresent || Boolean(data.avgWebcallCsatScores);
      });

      return webcallStats;
    }

    var service = {
      showTaskIncomingGraph: showTaskIncomingGraph,
      showTaskIncomingDummy: showTaskIncomingDummy,
      showTaskOfferedGraph: showTaskOfferedGraph,
      showTaskOfferedDummy: showTaskOfferedDummy,
      showTaskTimeGraph: showTaskTimeGraph,
      showTaskTimeDummy: showTaskTimeDummy,
      showAverageCsatGraph: showAverageCsatGraph,
      showAverageCsatDummy: showAverageCsatDummy,
      showTaskAggregateGraph: showTaskAggregateGraph,
      showTaskAggregateDummy: showTaskAggregateDummy,
      getTaskIncomingGraphConfig: getTaskIncomingGraphConfig,
      getTaskOfferedGraphConfig: getTaskOfferedGraphConfig,
      getTaskTimeGraphConfig: getTaskTimeGraphConfig,
      getAverageCsatGraphConfig: getAverageCsatGraphConfig,
      getTaskAggregateGraphConfig: getTaskAggregateGraphConfig,
      getWebcallDataStats: getWebcallDataStats,
      millisToTime: millisToTime,
      roundCSATAvg: roundCSATAvg,
    };

    return service;
  }
})();
