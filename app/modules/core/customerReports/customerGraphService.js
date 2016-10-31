(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerGraphService', CustomerGraphService);

  /* @ngInject */
  function CustomerGraphService($translate, CommonGraphService, ReportConstants, chartColors) {
    // reusable html for creating AmBalloon text
    var graphTextSpan = '<span class="graph-text">';
    var boldNumberSpan = '<span class="bold-number">';
    var spanClose = '</span>';

    // div variables
    var activeUserDiv = 'activeUsersChart';
    var avgRoomsdiv = 'avgRoomsChart';
    var filesSharedDiv = 'filesSharedChart';
    var mediaQualityDiv = 'mediaQualityChart';
    var metricsGraphDiv = 'callMetricsChart';
    var devicesDiv = 'devicesChart';

    // filter variables
    var filterValue = 0;
    var timeFilterValue = 0;

    // variables for Call Metrics
    var metricsBalloonText = graphTextSpan + '[[numCalls]] [[callCondition]] ([[percentage]]%)' + spanClose;
    var metricsLabelText = '[[percents]]%<br>[[callCondition]]';

    return {
      setActiveLineGraph: setActiveLineGraph,
      showHideActiveLineGraph: showHideActiveLineGraph,
      setActiveUsersGraph: setActiveUsersGraph,
      setAvgRoomsGraph: setAvgRoomsGraph,
      setFilesSharedGraph: setFilesSharedGraph,
      setMediaQualityGraph: setMediaQualityGraph,
      setDeviceGraph: setDeviceGraph,
      setMetricsGraph: setMetricsGraph
    };

    function setActiveLineGraph(data, chart, timeFilter) {
      timeFilterValue = timeFilter.value;
      if (_.isArray(data) && data.length > 0 && chart) {
        chart.chartCursor.valueLineEnabled = true;
        chart.categoryAxis.gridColor = chartColors.grayLightTwo;
        if (!data[0].balloon) {
          chart.chartCursor.valueLineEnabled = false;
          chart.categoryAxis.gridColor = chartColors.grayLightThree;
        }

        chart.chartScrollbar = undefined;
        chart.mouseWheelZoomEnabled = false;
        if (timeFilter.value === ReportConstants.FILTER_THREE.value && data.length > ReportConstants.THIRTEEN_WEEKS) {
          chart.chartScrollbar = CommonGraphService.getBaseVariable(CommonGraphService.SCROLL);
          chart.mouseWheelZoomEnabled = true;
          if (!data[0].balloon) {
            chart.chartScrollbar.selectedBackgroundColor = chartColors.grayLightOne;
          }
        }

        chart.graphs = getActiveLineGraphs(data);
        chart.dataProvider = data;
        chart.validateData();
        chart.validateNow();
      } else if (_.isArray(data) && data.length > 0) {
        chart = createActiveLineGraph(data);
        chart.addListener('rendered', zoomActiveUserChart);
      }
      return chart;
    }

    function zoomActiveUserChart(event) {
      var chart = _.get(event, 'chart');
      var chartData = _.get(event, 'chart.dataProvider');
      if (chart && chartData && (chartData.length > ReportConstants.THIRTEEN_WEEKS) && timeFilterValue === ReportConstants.FILTER_THREE.value) {
        chart.zoomToIndexes(chartData.length - ReportConstants.THIRTEEN_WEEKS, chartData.length - 1);
      }
    }

    function createActiveLineGraph(data) {
      var valueAxes = [CommonGraphService.getBaseVariable(CommonGraphService.AXIS)];
      valueAxes[0].integersOnly = true;

      var catAxis = CommonGraphService.getBaseVariable(CommonGraphService.AXIS);
      catAxis.startOnAxis = true;
      catAxis.gridAlpha = 1;
      catAxis.gridColor = chartColors.grayLightTwo;
      catAxis.tickLength = 5;
      catAxis.showFirstLabel = false;

      var chartCursor = CommonGraphService.getBaseVariable(CommonGraphService.CURSOR);
      chartCursor.valueLineAlpha = 1;
      chartCursor.valueLineEnabled = true;
      chartCursor.valueLineBalloonEnabled = true;
      chartCursor.cursorColor = chartColors.grayLightOne;

      if (!data[0].balloon) {
        chartCursor.valueLineEnabled = false;
        catAxis.gridColor = chartColors.grayLightThree;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, getActiveLineGraphs(data), CommonGraphService.DATE, catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(CommonGraphService.NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(CommonGraphService.LEGEND);
      chartData.chartCursor = chartCursor;
      chartData.legend.labelText = '[[' + CommonGraphService.TITLE + ']]';
      chartData.autoMargins = true;
      chartData.mouseWheelZoomEnabled = false;

      if (timeFilterValue === ReportConstants.FILTER_THREE.value && data.length > ReportConstants.THIRTEEN_WEEKS) {
        chartData.mouseWheelZoomEnabled = true;
        chartData.chartScrollbar = CommonGraphService.getBaseVariable(CommonGraphService.SCROLL);
        if (!data[0].balloon) {
          chartData.chartScrollbar.selectedBackgroundColor = chartColors.grayLightOne;
        }
      }

      return AmCharts.makeChart(activeUserDiv, chartData);
    }

    function getActiveUserBalloonText(graphDataItem, graph) {
      var usersTitle = $translate.instant('activeUsers.users');
      var data = _.get(graphDataItem, 'dataContext');
      var hiddenData = _.get(graph, 'data[0].category');
      var title = _.get(graph, CommonGraphService.TITLE);
      var balloonText = '';

      if (title === usersTitle && data.date !== hiddenData) {
        balloonText = graphTextSpan + $translate.instant('activeUsers.registeredUsers') + boldNumberSpan + ' ' + data.totalRegisteredUsers + spanClose + spanClose;
      } else if (data.date !== hiddenData) {
        balloonText = graphTextSpan + $translate.instant('activeUsers.activeUsers') + boldNumberSpan + ' ' + data.activeUsers;
        if (filterValue === ReportConstants.FILTER_ONE.value) {
          balloonText += ' (' + data.percentage + '%)';
        }
        balloonText += spanClose + spanClose;
      }

      return balloonText;
    }

    function getActiveLineGraphs(data) {
      var colors = [chartColors.colorPeopleLighter, chartColors.colorPeopleLight];
      var balloons = [true, true];
      var colorsTwo = _.clone(colors);
      var fillAlphas = [0.5, 0.5];
      var values = ['totalRegisteredUsers', 'activeUsers'];
      var titles = [$translate.instant('activeUsers.users'), $translate.instant('activeUsers.activeUsers')];
      var graphs = [];

      if (!data[0].balloon) {
        colors = [chartColors.dummyGrayLight, chartColors.dummyGray];
        colorsTwo = _.clone(colors);
        balloons = [false, false];
      }

      _.forEach(values, function (value, index) {
        graphs.push(CommonGraphService.getBaseVariable(CommonGraphService.LINE));
        graphs[index].bullet = 'none';
        graphs[index].title = titles[index];
        graphs[index].lineColor = colorsTwo[index];
        graphs[index].legendColor = colors[index];
        graphs[index].valueField = value;
        graphs[index].balloonFunction = getActiveUserBalloonText;
        graphs[index].showBalloon = balloons[index];
        graphs[index].clustered = false;
        graphs[index].fillAlphas = fillAlphas[index];
        graphs[index].lineThickness = 1;
      });

      return graphs;
    }

    function showHideActiveLineGraph(chart, filter) {
      filterValue = filter.value;
      if (filter.value === ReportConstants.FILTER_ONE.value) {
        chart.showGraph(chart.graphs[0]);
      } else {
        chart.hideGraph(chart.graphs[0]);
      }
      chart.validateNow();
    }

    function createActiveUsersGraph(data) {
      var valueAxes = [CommonGraphService.getBaseVariable(CommonGraphService.AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var catAxis = CommonGraphService.getBaseVariable(CommonGraphService.AXIS);
      catAxis.gridPosition = CommonGraphService.START;

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, activeUserGraphs(data), CommonGraphService.DATE, catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(CommonGraphService.NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(CommonGraphService.LEGEND);
      chartData.legend.labelText = '[[' + CommonGraphService.TITLE + ']]';

      return AmCharts.makeChart(activeUserDiv, chartData);
    }

    function activeUserGraphs(data) {
      var balloonText = graphTextSpan + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
      var colors = [chartColors.brandSuccessLight, chartColors.brandSuccessDark];
      if (!data[0].balloon) {
        colors = [chartColors.dummyGrayLight, chartColors.dummyGray];
      }
      var values = ['totalRegisteredUsers', 'activeUsers'];
      var titles = [$translate.instant('activeUsers.users'), $translate.instant('activeUsers.activeUsers')];

      var graphs = [];
      _.forEach(values, function (value, index) {
        graphs.push(CommonGraphService.getBaseVariable(CommonGraphService.COLUMN));
        graphs[index].title = titles[index];
        graphs[index].fillColors = colors[index];
        graphs[index].legendColor = colors[index];
        graphs[index].valueField = value;
        graphs[index].balloonText = balloonText;
        graphs[index].showBalloon = data[0].balloon;
        graphs[index].clustered = false;
      });
      return graphs;
    }

    function setActiveUsersGraph(data, chart) {
      if (_.isArray(data) && data.length > 0 && chart) {
        chart.startDuration = 1;
        if (!data[0].balloon) {
          chart.startDuration = 0;
        }

        chart.dataProvider = data;
        chart.graphs = activeUserGraphs(data);
        chart.validateData();
      } else if (_.isArray(data) && data.length > 0) {
        chart = createActiveUsersGraph(data);
      }
      return chart;
    }

    function setAvgRoomsGraph(data, chart) {
      if (_.isArray(data) && data.length > 0 && chart) {
        chart.startDuration = 1;
        if (!data[0].balloon) {
          chart.startDuration = 0;
        }

        chart.dataProvider = data;
        chart.graphs = avgRoomsGraphs(data);
        chart.validateData();
      } else if (_.isArray(data) && data.length > 0) {
        chart = createAvgRoomsGraph(data);
      }
      return chart;
    }

    function createAvgRoomsGraph(data) {
      var catAxis = CommonGraphService.getBaseVariable(CommonGraphService.AXIS);
      catAxis.gridPosition = CommonGraphService.START;

      var valueAxes = [CommonGraphService.getBaseVariable(CommonGraphService.AXIS)];
      valueAxes[0].totalColor = chartColors.brandWhite;
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, avgRoomsGraphs(data), CommonGraphService.DATE, catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(CommonGraphService.NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(CommonGraphService.LEGEND);

      return AmCharts.makeChart(avgRoomsdiv, chartData);
    }

    function avgRoomsGraphs(data) {
      var balloonText = graphTextSpan + $translate.instant('avgRooms.group') + ' <span class="room-number">[[groupRooms]]</span><br>' + $translate.instant('avgRooms.oneToOne') + ' <span class="room-number">[[oneToOneRooms]]</span><br>' + $translate.instant('avgRooms.avgTotal') + ' <span class="room-number">[[avgRooms]]</span></span>';
      var titles = ['avgRooms.group', 'avgRooms.oneToOne'];
      var values = ['totalRooms', 'oneToOneRooms'];
      var colors = [chartColors.primaryColorLight, chartColors.primaryColorDarker];
      if (!data[0].balloon) {
        colors = [chartColors.dummyGrayLight, chartColors.dummyGray];
      }

      var graphs = [];
      _.forEach(values, function (value, index) {
        graphs.push(CommonGraphService.getBaseVariable(CommonGraphService.COLUMN));
        graphs[index].title = $translate.instant(titles[index]);
        graphs[index].fillColors = colors[index];
        graphs[index].valueField = value;
        graphs[index].legendColor = colors[index];
        graphs[index].showBalloon = data[0].balloon;
        graphs[index].balloonText = balloonText;
        graphs[index].clustered = false;
      });
      return graphs;
    }

    function setFilesSharedGraph(data, chart) {
      if (_.isArray(data) && data.length > 0 && chart) {
        chart.startDuration = 1;
        if (!data[0].balloon) {
          chart.startDuration = 0;
        }

        chart.dataProvider = data;
        chart.graphs = filesSharedGraphs(data);
        chart.validateData();
      } else if (_.isArray(data) && data.length > 0) {
        chart = createFilesSharedGraph(data);
      }
      return chart;
    }

    function createFilesSharedGraph(data) {
      var catAxis = CommonGraphService.getBaseVariable(CommonGraphService.AXIS);
      catAxis.gridPosition = CommonGraphService.START;

      var valueAxes = [CommonGraphService.getBaseVariable(CommonGraphService.AXIS)];
      valueAxes[0].totalColor = chartColors.brandWhite;
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, filesSharedGraphs(data), CommonGraphService.DATE, catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(CommonGraphService.NUMFORMAT);

      return AmCharts.makeChart(filesSharedDiv, chartData);
    }

    function filesSharedGraphs(data) {
      var color = chartColors.brandSuccess;
      var balloonText = graphTextSpan + $translate.instant('filesShared.filesShared') + ' <span class="graph-number">[[contentShared]]</span><br>' + $translate.instant('filesShared.fileSizes') + ' <span class="graph-number">[[contentShareSizes]] ' + $translate.instant('filesShared.gb ') + '</span></span>';

      if (!data[0].balloon) {
        color = chartColors.dummyGray;
      }

      var graph = CommonGraphService.getBaseVariable(CommonGraphService.COLUMN);
      graph.title = $translate.instant('filesShared.filesShared');
      graph.fillColors = color;
      graph.colorField = color;
      graph.valueField = 'contentShared';
      graph.showBalloon = data[0].balloon;
      graph.balloonText = balloonText;

      return [graph];
    }

    function setMediaQualityGraph(data, chart, filter) {
      if (_.isArray(data) && data.length > 0 && chart) {
        chart.startDuration = 1;
        if (!data[0].balloon) {
          chart.startDuration = 0;
        }

        chart.dataProvider = data;
        chart.graphs = mediaGraphs(data, filter);
        chart.validateData();
      } else if (_.isArray(data) && data.length > 0) {
        chart = createMediaGraph(data, filter);
      }
      return chart;
    }

    function createMediaGraph(data, filter) {
      var catAxis = CommonGraphService.getBaseVariable(CommonGraphService.AXIS);
      catAxis.gridPosition = CommonGraphService.START;

      var valueAxes = [CommonGraphService.getBaseVariable(CommonGraphService.AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;
      valueAxes[0].title = $translate.instant('mediaQuality.minutes');

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, mediaGraphs(data, filter), CommonGraphService.DATE, catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(CommonGraphService.NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(CommonGraphService.LEGEND);

      return AmCharts.makeChart(mediaQualityDiv, chartData);
    }

    function mediaGraphs(data, filter) {
      var values = ['totalDurationSum', 'partialSum', 'poorQualityDurationSum'];
      var balloonValues = ['goodQualityDurationSum', 'fairQualityDurationSum', 'poorQualityDurationSum'];
      if (filter.value === ReportConstants.FILTER_TWO.value) {
        values = ['totalAudioDurationSum', 'partialAudioSum', 'poorAudioQualityDurationSum'];
        balloonValues = ['goodAudioQualityDurationSum', 'fairAudioQualityDurationSum', 'poorAudioQualityDurationSum'];
      } else if (filter.value === ReportConstants.FILTER_THREE.value) {
        values = ['totalVideoDurationSum', 'partialVideoSum', 'poorVideoQualityDurationSum'];
        balloonValues = ['goodVideoQualityDurationSum', 'fairVideoQualityDurationSum', 'poorVideoQualityDurationSum'];
      }

      var titles = ['mediaQuality.good', 'mediaQuality.fair', 'mediaQuality.poor'];
      var colors = [chartColors.blue, chartColors.brandWarning, chartColors.brandDanger];
      if (!data[0].balloon) {
        colors = [chartColors.dummyGrayLighter, chartColors.dummyGrayLight, chartColors.dummyGray];
      }

      var graphs = [];
      _.forEach(colors, function (color, index) {
        graphs.push(CommonGraphService.getBaseVariable(CommonGraphService.COLUMN));
        graphs[index].title = $translate.instant(titles[index]);
        graphs[index].fillColors = color;
        graphs[index].colorField = color;
        graphs[index].valueField = values[index];
        graphs[index].legendColor = color;
        graphs[index].showBalloon = data[0].balloon;
        graphs[index].balloonText = '<span class="graph-text">' + $translate.instant('mediaQuality.totalCalls') + ': ' + ' <span class="graph-media">[[' + values[0] + ']]</span><br>' + $translate.instant(titles[index]) + ': ' + '<span class="graph-media"> [[' + balloonValues[index] + ']]</span></span>';
        graphs[index].clustered = false;
      });
      return graphs;
    }

    function setDeviceGraph(data, chart, filter) {
      if (_.isArray(data) && data.length > 0 && chart) {
        var graphNumber = 0;
        if (filter && filter.value > 0) {
          graphNumber = filter.value;
        }

        chart.startDuration = 1;
        if (!data[graphNumber].balloon) {
          chart.startDuration = 0;
        }

        chart.dataProvider = data[graphNumber].graph;
        chart.graphs = deviceGraphs(data, filter);
        chart.validateData();
      } else if (_.isArray(data) && data.length > 0) {
        chart = createDeviceGraph(data, filter);
      }
      return chart;
    }

    function createDeviceGraph(data, filter) {
      var graphNumber = 0;
      if (filter && filter.value > 0) {
        graphNumber = filter.value;
      }

      var catAxis = CommonGraphService.getBaseVariable(CommonGraphService.AXIS);
      catAxis.gridPosition = CommonGraphService.START;

      var valueAxes = [CommonGraphService.getBaseVariable(CommonGraphService.AXIS)];
      valueAxes[graphNumber].integersOnly = true;
      valueAxes[graphNumber].minimum = 0;

      var startDuration = 1;
      if (!data[graphNumber].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data[graphNumber].graph, startDuration, valueAxes, deviceGraphs(data, filter), CommonGraphService.DATE, catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(CommonGraphService.NUMFORMAT);
      return AmCharts.makeChart(devicesDiv, chartData);
    }

    function deviceGraphs(data, filter) {
      var color = chartColors.colorPeopleBase;
      if (!data[0].balloon) {
        color = chartColors.grayLighter;
      }

      var graphNumber = 0;
      if (filter && filter.value > 0) {
        graphNumber = filter.value;
      }

      var graph = CommonGraphService.getBaseVariable(CommonGraphService.COLUMN);
      graph.title = $translate.instant('registeredEndpoints.registeredEndpoints');
      graph.fillColors = color;
      graph.colorField = color;
      graph.valueField = 'totalRegisteredDevices';
      graph.balloonText = graphTextSpan + $translate.instant('registeredEndpoints.registeredEndpoints') + ' <span class="device-number">[[totalRegisteredDevices]]</span></span>';
      graph.showBalloon = data[graphNumber].balloon;

      return [graph];
    }

    function setMetricsGraph(data, chart) {
      if (data && chart) {
        chart.balloonText = metricsBalloonText;
        if (data.dummy) {
          chart.balloonText = '';
        }

        chart.dataProvider = data.dataProvider;
        chart.validateData();
      } else if (data) {
        chart = createMetricsGraph(data);
      }
      return chart;
    }

    function createMetricsGraph(data) {
      var balloonText = metricsBalloonText;
      if (data.dummy) {
        balloonText = '';
      }

      var chartData = CommonGraphService.getBasePieChart(data.dataProvider, balloonText, '65%', '30%', metricsLabelText, true, 'callCondition', 'percentage', CommonGraphService.COLOR, CommonGraphService.COLOR);
      return AmCharts.makeChart(metricsGraphDiv, chartData);
    }
  }
})();
