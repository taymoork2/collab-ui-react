(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerGraphService', CustomerGraphService);

  /* @ngInject */
  function CustomerGraphService($translate, CommonGraphService, chartColors) {
    // Keys for base variables in CommonGraphService
    var AXIS = 'axis';
    var COLUMN = 'column';
    var LEGEND = 'legend';
    var LINE = 'line';
    var NUMFORMAT = 'numFormat';
    var CURSOR = 'cursor';

    // reusable html for creating AmBalloon text
    var graphTextSpan = '<span class="graph-text">';
    var boldNumberSpan = '<span class="bold-number">';
    var spanClose = '</span>';

    // variables for the active users section
    var activeUserDiv = 'activeUsersdiv';
    var activeUsersBalloonText = graphTextSpan + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var usersTitle = $translate.instant('activeUsers.users');
    var activeUsersTitle = $translate.instant('activeUsers.activeUsers');
    var filterValue = 0;

    // variables for the average rooms section
    var avgRoomsdiv = 'avgRoomsdiv';
    var avgRoomsBalloon = graphTextSpan + $translate.instant('avgRooms.group') + ' <span class="room-number">[[groupRooms]]</span><br>' + $translate.instant('avgRooms.oneToOne') + ' <span class="room-number">[[oneToOneRooms]]</span><br>' + $translate.instant('avgRooms.avgTotal') + ' <span class="room-number">[[avgRooms]]</span></span>';

    // variables for the files shared section
    var filesSharedDiv = 'filesSharedDiv';
    var filesBalloon = graphTextSpan + $translate.instant('filesShared.filesShared') + ' <span class="graph-number">[[contentShared]]</span><br>' + $translate.instant('filesShared.fileSizes') + ' <span class="graph-number">[[contentShareSizes]] ' + $translate.instant('filesShared.gb ') + '</span></span>';

    // variables for media Quality
    var mediaQualityDiv = 'mediaQualityDiv';

    // variables for Call Metrics
    var metricsGraphDiv = 'metricsGraphDiv';
    var metricsBalloonText = graphTextSpan + '[[numCalls]] [[callCondition]] ([[percentage]]%)' + spanClose;
    var metricsLabelText = '[[percents]]%<br>[[callCondition]]';

    // variables for device registration
    var devicesDiv = 'devicesDiv';
    var deviceBalloonText = graphTextSpan + $translate.instant('registeredEndpoints.registeredEndpoints') + ' <span class="device-number">[[totalRegisteredDevices]]</span></span>';

    return {
      setActiveLineGraph: setActiveLineGraph,
      setActiveUsersGraph: setActiveUsersGraph,
      setAvgRoomsGraph: setAvgRoomsGraph,
      setFilesSharedGraph: setFilesSharedGraph,
      setMediaQualityGraph: setMediaQualityGraph,
      setDeviceGraph: setDeviceGraph,
      setMetricsGraph: setMetricsGraph
    };

    function setActiveLineGraph(data, chart, filter) {
      filterValue = filter.value;
      if (_.isArray(data) && data.length > 0 && chart) {
        if (data[0].balloon) {
          chart.chartCursor.valueLineEnabled = true;
          chart.categoryAxis.gridColor = chartColors.grayLightTwo;
        } else {
          chart.chartCursor.valueLineEnabled = false;
          chart.categoryAxis.gridColor = chartColors.grayLightThree;
        }

        chart.graphs = getActiveLineGraphs(data, filter);
        chart.dataProvider = data;
        chart.validateData();
      } else if (_.isArray(data) && data.length > 0) {
        chart = createActiveLineGraph(data, filter);
      }
      return chart;
    }

    function createActiveLineGraph(data, filter) {
      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.startOnAxis = true;
      catAxis.gridAlpha = 1;
      catAxis.gridColor = chartColors.grayLightTwo;
      catAxis.tickLength = 5;
      catAxis.showFirstLabel = false;

      var chartCursor = CommonGraphService.getBaseVariable(CURSOR);
      chartCursor.valueLineAlpha = 1;
      chartCursor.valueLineEnabled = true;
      chartCursor.valueLineBalloonEnabled = true;
      chartCursor.cursorColor = chartColors.grayLightOne;

      if (!data[0].balloon) {
        chartCursor.valueLineEnabled = false;
        catAxis.gridColor = chartColors.grayLightThree;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, getActiveLineGraphs(data, filter), 'date', catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(LEGEND);
      chartData.chartCursor = chartCursor;
      chartData.legend.labelText = '[[title]]';
      chartData.autoMargins = true;

      return AmCharts.makeChart(activeUserDiv, chartData);
    }

    function getActiveUserBalloonText(graphDataItem, graph) {
      var data = _.get(graphDataItem, 'dataContext');
      var hiddenData = _.get(graph, 'data[0].category');
      var title = _.get(graph, 'title');
      var balloonText = '';

      if (title === usersTitle && data.date !== hiddenData) {
        balloonText = graphTextSpan + $translate.instant('activeUsers.registeredUsers') + boldNumberSpan + ' ' + data.totalRegisteredUsers + spanClose + spanClose;
      } else if (data.date !== hiddenData) {
        balloonText = graphTextSpan + activeUsersTitle + boldNumberSpan + ' ' + data.activeUsers;
        if (filterValue === 0) {
          balloonText += ' (' + data.percentage + '%)';
        }
        balloonText += spanClose + spanClose;
      }

      return balloonText;
    }

    function getActiveLineGraphs(data, filter) {
      var colors = [chartColors.colorPeopleLighter, chartColors.colorPeopleLight];
      var balloons = [true, true];
      var colorsTwo = _.clone(colors);
      var fillAlphas = [0.5, 0.5];
      if (!data[0].balloon) {
        colors = [chartColors.dummyGrayLight, chartColors.dummyGray];
        colorsTwo = _.clone(colors);
        balloons = [false, false];
      } else if (filter.value > 0) {
        colorsTwo = [chartColors.brandWhite, chartColors.colorPeopleLight];
        balloons = [false, true];
        fillAlphas = [0, 0.5];
      }
      var values = ['totalRegisteredUsers', 'activeUsers'];
      var titles = [usersTitle, activeUsersTitle];
      var graphs = [];

      _.forEach(values, function (value, index) {
        graphs.push(CommonGraphService.getBaseVariable(LINE));
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

    function createActiveUsersGraph(data) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }

      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, activeUserGraphs(data), 'date', catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';

      return AmCharts.makeChart(activeUserDiv, chartData);
    }

    function activeUserGraphs(data) {
      var colors = [chartColors.brandSuccessLight, chartColors.brandSuccessDark];
      if (!data[0].balloon) {
        colors = [chartColors.dummyGrayLight, chartColors.dummyGray];
      }
      var values = ['totalRegisteredUsers', 'activeUsers'];
      var titles = [usersTitle, activeUsersTitle];
      var graphs = [];

      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonGraphService.getBaseVariable(COLUMN));
        graphs[i].title = titles[i];
        graphs[i].fillColors = colors[i];
        graphs[i].legendColor = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].balloonText = activeUsersBalloonText;
        graphs[i].showBalloon = data[0].balloon;
        graphs[i].clustered = false;
      }

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
        if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
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
      if (data.length === 0) {
        return;
      }

      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';

      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[0].totalColor = chartColors.brandWhite;
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var startDuration = 1;
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, avgRoomsGraphs(data), 'date', catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(LEGEND);

      return AmCharts.makeChart(avgRoomsdiv, chartData);
    }

    function avgRoomsGraphs(data) {
      var titles = ['avgRooms.group', 'avgRooms.oneToOne'];
      var values = ['totalRooms', 'oneToOneRooms'];
      var colors = [chartColors.primaryColorLight, chartColors.primaryColorDarker];
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        colors = [data[0].colorOne, data[0].colorTwo];
      }
      var graphs = [];

      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonGraphService.getBaseVariable(COLUMN));
        graphs[i].title = $translate.instant(titles[i]);
        graphs[i].fillColors = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].legendColor = colors[i];
        graphs[i].showBalloon = data[0].balloon;
        graphs[i].balloonText = avgRoomsBalloon;
        graphs[i].clustered = false;
      }

      return graphs;
    }

    function setFilesSharedGraph(data, chart) {
      if (_.isArray(data) && data.length > 0 && chart) {
        chart.startDuration = 1;
        if (data[0].color === chartColors.dummyGray) {
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
      if (data.length === 0) {
        return;
      }

      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';

      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[0].totalColor = chartColors.brandWhite;
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var startDuration = 1;
      if (data[0].color === chartColors.dummyGray) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, filesSharedGraphs(data), 'date', catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(NUMFORMAT);

      return AmCharts.makeChart(filesSharedDiv, chartData);
    }

    function filesSharedGraphs(data) {
      var graph = CommonGraphService.getBaseVariable(COLUMN);
      graph.title = $translate.instant('filesShared.filesShared');
      graph.fillColors = data[0].color;
      graph.colorField = data[0].color;
      graph.valueField = 'contentShared';
      graph.showBalloon = data[0].balloon;
      graph.balloonText = filesBalloon;

      return [graph];
    }

    function setMediaQualityGraph(data, chart, filter) {
      if (_.isArray(data) && data.length > 0 && chart) {
        chart.startDuration = 1;
        if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
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

    function createMediaGraph(data, mediaFilter) {
      if (data.length === 0) {
        return;
      }

      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';

      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;
      valueAxes[0].title = $translate.instant('mediaQuality.minutes');

      var startDuration = 1;
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, mediaGraphs(data, mediaFilter), 'date', catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(LEGEND);

      return AmCharts.makeChart(mediaQualityDiv, chartData);
    }

    function mediaGraphs(data, mediaFilter) {
      var values = ['totalDurationSum', 'partialSum', 'poorQualityDurationSum'];
      var balloonValues = ['goodQualityDurationSum', 'fairQualityDurationSum', 'poorQualityDurationSum'];
      if (mediaFilter.value === 1) {
        values = ['totalAudioDurationSum', 'partialAudioSum', 'poorAudioQualityDurationSum'];
        balloonValues = ['goodAudioQualityDurationSum', 'fairAudioQualityDurationSum', 'poorAudioQualityDurationSum'];
      } else if (mediaFilter.value === 2) {
        values = ['totalVideoDurationSum', 'partialVideoSum', 'poorVideoQualityDurationSum'];
        balloonValues = ['goodVideoQualityDurationSum', 'fairVideoQualityDurationSum', 'poorVideoQualityDurationSum'];
      }

      var titles = ['mediaQuality.good', 'mediaQuality.fair', 'mediaQuality.poor'];
      var colors = [chartColors.blue, chartColors.brandWarning, chartColors.brandDanger];
      if (!data[0].balloon) {
        colors = [chartColors.dummyGrayLighter, chartColors.dummyGrayLight, chartColors.dummyGray];
      }
      var graphs = [];

      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonGraphService.getBaseVariable(COLUMN));
        graphs[i].title = $translate.instant(titles[i]);
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].legendColor = colors[i];
        graphs[i].showBalloon = data[0].balloon;
        graphs[i].balloonText = '<span class="graph-text">' + $translate.instant('mediaQuality.totalCalls') + ': ' + ' <span class="graph-media">[[' + values[0] + ']]</span><br>' + $translate.instant(titles[i]) + ': ' + '<span class="graph-media"> [[' + balloonValues[i] + ']]</span></span>';
        graphs[i].clustered = false;
      }

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
      if (data.length === 0) {
        return;
      }

      var graphNumber = 0;
      if (filter && filter.value > 0) {
        graphNumber = filter.value;
      }

      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';

      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[graphNumber].integersOnly = true;
      valueAxes[graphNumber].minimum = 0;

      var startDuration = 1;
      if (!data[graphNumber].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data[graphNumber].graph, startDuration, valueAxes, deviceGraphs(data, filter), 'date', catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(NUMFORMAT);
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

      var graph = CommonGraphService.getBaseVariable(COLUMN);
      graph.title = $translate.instant('registeredEndpoints.registeredEndpoints');
      graph.fillColors = color;
      graph.colorField = color;
      graph.valueField = 'totalRegisteredDevices';
      graph.balloonText = deviceBalloonText;
      graph.showBalloon = data[graphNumber].balloon;

      return [graph];
    }

    function setMetricsGraph(data, chart) {
      if (data && chart) {
        chart.balloonText = metricsBalloonText;
        if (data.dummy) {
          chart.balloonText = "";
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
        balloonText = "";
      }

      var chartData = CommonGraphService.getBasePieChart(data.dataProvider, balloonText, "65%", "30%", metricsLabelText, true, "callCondition", "percentage", "color", "color");
      return AmCharts.makeChart(metricsGraphDiv, chartData);
    }
  }
})();
