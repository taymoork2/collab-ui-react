(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerGraphService', CustomerGraphService);

  /* @ngInject */
  function CustomerGraphService($translate, CommonGraphService, chartColors) {
    // Keys for base variables in CommonGraphService
    var COLUMN = 'column';
    var AXIS = 'axis';
    var LEGEND = 'legend';
    var NUMFORMAT = 'numFormat';

    // variables for the active users section
    var activeUserDiv = 'activeUsersdiv';
    var activeUsersBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var usersTitle = $translate.instant('activeUsers.users');
    var activeUsersTitle = $translate.instant('activeUsers.activeUsers');

    // variables for the average rooms section
    var avgRoomsdiv = 'avgRoomsdiv';
    var avgRoomsBalloon = '<span class="graph-text">' + $translate.instant('avgRooms.group') + ' <span class="room-number">[[groupRooms]]</span><br>' + $translate.instant('avgRooms.oneToOne') + ' <span class="room-number">[[oneToOneRooms]]</span><br>' + $translate.instant('avgRooms.avgTotal') + ' <span class="room-number">[[avgRooms]]</span></span>';

    // variables for the files shared section
    var filesSharedDiv = 'filesSharedDiv';
    var filesBalloon = '<span class="graph-text">' + $translate.instant('filesShared.filesShared') + ' <span class="graph-number">[[contentShared]]</span><br>' + $translate.instant('filesShared.fileSizes') + ' <span class="graph-number">[[contentShareSizes]] ' + $translate.instant('filesShared.gb ') + '</span></span>';

    // variables for media Quality
    var mediaQualityDiv = 'mediaQualityDiv';

    // variables for Call Metrics
    var metricsGraphDiv = 'metricsGraphDiv';
    var metricsBalloonText = '<span class="graph-text">[[numCalls]] [[callCondition]] ([[percentage]]%)</span>';
    var metricsLabelText = '[[percents]]%<br>[[callCondition]]';

    // variables for device registration
    var devicesDiv = 'devicesDiv';
    var deviceBalloonText = '<span class="graph-text">' + $translate.instant('registeredEndpoints.registeredEndpoints') + ' <span class="device-number">[[totalRegisteredDevices]]</span></span>';

    return {
      setActiveUsersGraph: setActiveUsersGraph,
      setAvgRoomsGraph: setAvgRoomsGraph,
      setFilesSharedGraph: setFilesSharedGraph,
      setMediaQualityGraph: setMediaQualityGraph,
      setDeviceGraph: setDeviceGraph,
      setMetricsGraph: setMetricsGraph
    };

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
      var colors = ['colorOne', 'colorTwo'];
      var secondaryColors = [data[0].colorOne, data[0].colorTwo];
      var values = ['totalRegisteredUsers', 'activeUsers'];
      var titles = [usersTitle, activeUsersTitle];
      var graphs = [];

      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonGraphService.getBaseVariable(COLUMN));
        graphs[i].title = titles[i];
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].legendColor = secondaryColors[i];
        graphs[i].valueField = values[i];
        graphs[i].balloonText = activeUsersBalloonText;
        graphs[i].showBalloon = data[0].balloon;
        graphs[i].clustered = false;
      }

      return graphs;
    }

    function setActiveUsersGraph(data, activeUsersChart) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (activeUsersChart !== null && angular.isDefined(activeUsersChart)) {
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }

        activeUsersChart.dataProvider = data;
        activeUsersChart.graphs = activeUserGraphs(data);
        activeUsersChart.startDuration = startDuration;
        activeUsersChart.validateData();
        return activeUsersChart;
      } else {
        activeUsersChart = createActiveUsersGraph(data);
        return activeUsersChart;
      }
    }

    function setAvgRoomsGraph(data, avgRoomsChart) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (avgRoomsChart !== null && angular.isDefined(avgRoomsChart)) {
        var startDuration = 1;
        if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
          startDuration = 0;
        }

        avgRoomsChart.dataProvider = data;
        avgRoomsChart.graphs = avgRoomsGraphs(data);
        avgRoomsChart.startDuration = startDuration;
        avgRoomsChart.validateData();
      } else {
        avgRoomsChart = createAvgRoomsGraph(data);
      }
      return avgRoomsChart;
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
        graphs[i].colorField = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].legendColor = colors[i];
        graphs[i].showBalloon = data[0].balloon;
        graphs[i].balloonText = avgRoomsBalloon;
        graphs[i].clustered = false;
      }

      return graphs;
    }

    function setFilesSharedGraph(data, filesSharedChart) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (filesSharedChart !== null && angular.isDefined(filesSharedChart)) {
        var startDuration = 1;
        if (data[0].color === chartColors.dummyGray) {
          startDuration = 0;
        }

        filesSharedChart.dataProvider = data;
        filesSharedChart.graphs = filesSharedGraphs(data);
        filesSharedChart.startDuration = startDuration;
        filesSharedChart.validateData();
      } else {
        filesSharedChart = createFilesSharedGraph(data);
      }
      return filesSharedChart;
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

    function setMediaQualityGraph(data, mediaChart, mediaFilter) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (mediaChart !== null && angular.isDefined(mediaChart)) {
        var startDuration = 1;
        if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
          startDuration = 0;
        }

        mediaChart.dataProvider = data;
        mediaChart.graphs = mediaGraphs(data, mediaFilter);
        mediaChart.startDuration = startDuration;
        mediaChart.validateData();
      } else {
        mediaChart = createMediaGraph(data, mediaFilter);
      }
      return mediaChart;
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
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        colors = [data[0].colorThree, data[0].colorTwo, data[0].colorOne];
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
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (chart !== null && angular.isDefined(chart)) {
        var graphNumber = 0;
        if (angular.isDefined(filter) && (filter.value > 0)) {
          graphNumber = filter.value;
        }

        var startDuration = 1;
        if (!data[graphNumber].balloon) {
          startDuration = 0;
        }

        chart.dataProvider = data[graphNumber].graph;
        chart.graphs = deviceGraphs(data, filter);
        chart.startDuration = startDuration;
        chart.validateData();
      } else {
        chart = createDeviceGraph(data, filter);
      }
      return chart;
    }

    function createDeviceGraph(data, filter) {
      if (data.length === 0) {
        return;
      }

      var graphNumber = 0;
      if (angular.isDefined(filter) && (filter.value > 0)) {
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
      if (angular.isDefined(filter) && (filter.value > 0)) {
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

    function setMetricsGraph(data, metricsChart) {
      if ((data === null || data === 'undefined' || data.length === 0) && (angular.isUndefined(data.dataProvider) || angular.isUndefined(data.labelData))) {
        return;
      } else if (metricsChart !== null && angular.isDefined(metricsChart)) {
        var balloonText = metricsBalloonText;
        if (data.dummy) {
          balloonText = "";
        }

        metricsChart.dataProvider = data.dataProvider;
        metricsChart.balloonText = balloonText;
        metricsChart.validateData();
      } else {
        metricsChart = createMetricsGraph(data);
      }
      return metricsChart;
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
