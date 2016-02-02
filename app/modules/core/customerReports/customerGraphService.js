(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerGraphService', CustomerGraphService);

  /* @ngInject */
  function CustomerGraphService($translate, Config) {
    // Base variables for building grids and charts
    var columnBase = {
      'type': 'column',
      'fillAlphas': 1,
      'lineAlpha': 0,
      'balloonColor': Config.chartColors.grayLight,
      'columnWidth': 0.6,
      'fontSize': 14,
    };
    var axis = {
      'axisColor': Config.chartColors.grayLight,
      'gridColor': Config.chartColors.grayLight,
      'color': Config.chartColors.grayDarkest,
      'gridAlpha': 0,
      'axisAlpha': 1,
      'tickLength': 0
    };
    var legendBase = {
      'color': Config.chartColors.grayDarkest,
      'align': 'center',
      'autoMargins': false,
      'switchable': false,
      'fontSize': 13,
      'markerLabelGap': 10,
      'markerType': 'square',
      'markerSize': 10,
      'position': 'bottom',
      'equalWidths': false,
      'horizontalGap': 5,
      'valueAlign': 'left',
      'valueWidth': 0,
      'verticalGap': 20
    };

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
    var deviceBalloonText = '<span class="graph-text">' + $translate.instant('registeredEndpoints.registeredEndpoints') + ' <span class="graph-number">[[totalRegisteredDevices]]</span></span>';

    return {
      setActiveUsersGraph: setActiveUsersGraph,
      setAvgRoomsGraph: setAvgRoomsGraph,
      setFilesSharedGraph: setFilesSharedGraph,
      setMediaQualityGraph: setMediaQualityGraph,
      setDeviceGraph: setDeviceGraph,
      setMetricsGraph: setMetricsGraph
    };

    // bar charts
    function createGraph(data, div, graphs, valueAxes, catAxis, categoryField, legend, startDuration) {
      var chartData = {
        'startDuration': startDuration,
        'startEffect': 'easeOutSine',
        'type': 'serial',
        'addClassNames': true,
        'fontFamily': 'Arial',
        'backgroundColor': Config.chartColors.brandWhite,
        'backgroundAlpha': 1,
        'dataProvider': data,
        'valueAxes': valueAxes,
        'graphs': graphs,
        'balloon': {
          'adjustBorderColor': true,
          'borderThickness': 1,
          'fillAlpha': 1,
          'fillColor': Config.chartColors.brandWhite,
          'fixedPosition': true,
          'shadowAlpha': 0
        },
        'autoMargins': false,
        'marginTop': 60,
        'categoryField': categoryField,
        'categoryAxis': catAxis,
        'usePrefixes': true,
        'prefixesOfBigNumbers': [{
          number: 1e+3,
          prefix: "K"
        }, {
          number: 1e+6,
          prefix: "M"
        }, {
          number: 1e+9,
          prefix: "B"
        }, {
          number: 1e+12,
          prefix: "T"
        }],
        'numberFormatter': {
          'precision': 0,
          'decimalSeparator': '.',
          'thousandsSeparator': ','
        },
        'export': {
          "enabled": true,
          "libs": {
            "autoLoad": false
          },
          "menu": [{
            "class": "export-main",
            "label": $translate.instant('reportsPage.downloadOptions'),
            "menu": [{
              "label": $translate.instant('reportsPage.saveAs'),
              "title": $translate.instant('reportsPage.saveAs'),
              "class": "export-list",
              "menu": ["PNG", "JPG", "PDF"]
            }, 'PRINT']
          }]
        }
      };

      if (angular.isDefined(legend) && legend !== null) {
        chartData.legend = legend;
      }

      return AmCharts.makeChart(div, chartData);
    }

    function createActiveUsersGraph(data) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }

      var graphs = activeUserGraphs(data);
      var valueAxes = [angular.copy(axis)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var legend = angular.copy(legendBase);
      legend.labelText = '[[title]]';

      var startDuration = 1;
      if (data[0].colorOne === Config.chartColors.dummyGrayLight) {
        startDuration = 0;
      }

      return createGraph(data, activeUserDiv, graphs, valueAxes, catAxis, 'modifiedDate', legend, startDuration);
    }

    function activeUserGraphs(data) {
      var colors = ['colorOne', 'colorTwo'];
      var secondaryColors = [data[0].colorOne, data[0].colorTwo];
      var values = ['totalRegisteredUsers', 'activeUsers'];
      var titles = [usersTitle, activeUsersTitle];
      var graphs = [];

      for (var i = 0; i < values.length; i++) {
        graphs.push(angular.copy(columnBase));
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
        if (data[0].colorOne === Config.chartColors.dummyGrayLight) {
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

      var graphs = avgRoomsGraphs(data);
      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].totalColor = Config.chartColors.brandWhite;
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var startDuration = 1;
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        startDuration = 0;
      }

      return createGraph(data, avgRoomsdiv, graphs, valueAxes, catAxis, 'modifiedDate', angular.copy(legendBase), startDuration);
    }

    function avgRoomsGraphs(data) {
      var titles = ['avgRooms.group', 'avgRooms.oneToOne'];
      var values = ['totalRooms', 'oneToOneRooms'];
      var colors = [Config.chartColors.primaryColorLight, Config.chartColors.primaryColorDarker];
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        colors = [data[0].colorOne, data[0].colorTwo];
      }
      var graphs = [];

      for (var i = 0; i < values.length; i++) {
        graphs.push(angular.copy(columnBase));
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
        if (data[0].color === Config.chartColors.dummyGray) {
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

      var graphs = filesSharedGraphs(data);
      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].totalColor = Config.chartColors.brandWhite;
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var startDuration = 1;
      if (data[0].color === Config.chartColors.dummyGray) {
        startDuration = 0;
      }

      return createGraph(data, filesSharedDiv, graphs, valueAxes, catAxis, 'modifiedDate', null, startDuration);
    }

    function filesSharedGraphs(data) {
      var graph = angular.copy(columnBase);
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

      var graphs = mediaGraphs(data, mediaFilter);
      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;
      valueAxes[0].title = $translate.instant('mediaQuality.minutes');

      var startDuration = 1;
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        startDuration = 0;
      }

      return createGraph(data, mediaQualityDiv, graphs, valueAxes, catAxis, 'modifiedDate', angular.copy(legendBase), startDuration);
    }

    function mediaGraphs(data, mediaFilter) {
      var values = ['totalDurationSum', 'partialSum', 'poorAudioQualityDurationSum'];
      var balloonValues = ['goodQualityDurationSum', 'fairQualityDurationSum', 'poorAudioQualityDurationSum'];
      if (mediaFilter.value === 1) {
        values = ['totalAudioDurationSum', 'partialAudioSum', 'poorQualityDurationSum'];
        balloonValues = ['goodAudioQualityDurationSum', 'fairAudioQualityDurationSum', 'poorQualityDurationSum'];
      } else if (mediaFilter.value === 2) {
        values = ['totalVideoDurationSum', 'partialVideoSum', 'poorVideoQualityDurationSum'];
        balloonValues = ['goodVideoQualityDurationSum', 'fairVideoQualityDurationSum', 'poorVideoQualityDurationSum'];
      }

      var titles = ['mediaQuality.good', 'mediaQuality.fair', 'mediaQuality.poor'];
      var colors = [Config.chartColors.blue, Config.chartColors.brandWarning, Config.chartColors.brandDanger];
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        colors = [data[0].colorThree, data[0].colorTwo, data[0].colorOne];
      }
      var graphs = [];

      for (var i = 0; i < values.length; i++) {
        graphs.push(angular.copy(columnBase));
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

      var graphs = deviceGraphs(data, filter);
      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var valueAxes = [angular.copy(axis)];
      valueAxes[graphNumber].integersOnly = true;
      valueAxes[graphNumber].minimum = 0;

      var startDuration = 1;
      if (!data[graphNumber].balloon) {
        startDuration = 0;
      }

      return createGraph(data[graphNumber].graph, devicesDiv, graphs, valueAxes, catAxis, 'modifiedDate', null, startDuration);
    }

    function deviceGraphs(data, filter) {
      var color = Config.chartColors.colorPeopleBase;
      if (!data[0].balloon) {
        color = Config.chartColors.grayLighter;
      }

      var graphNumber = 0;
      if (angular.isDefined(filter) && (filter.value > 0)) {
        graphNumber = filter.value;
      }

      var graph = angular.copy(columnBase);
      graph.title = $translate.instant('registeredEndpoints.registeredEndpoints');
      graph.fillColors = color;
      graph.colorField = color;
      graph.valueField = 'totalRegisteredDevices';
      graph.balloonText = deviceBalloonText;
      graph.showBalloon = data[graphNumber].balloon;

      return [graph];
    }

    // donut charts
    function createDonutChart(div, balloonText, labelText, dataProvider) {
      return AmCharts.makeChart(div, {
        "type": "pie",
        "balloonText": balloonText,
        'balloon': {
          'adjustBorderColor': true,
          'borderThickness': 1,
          'fillAlpha': 1,
          'fillColor': Config.chartColors.brandWhite,
          'fixedPosition': true,
          'shadowAlpha': 0
        },
        "innerRadius": "65%",
        "labelText": labelText,
        "colorField": "color",
        "labelColorField": "color",
        "titleField": "callCondition",
        "valueField": "percentage",
        "fontFamily": "Arial",
        "fontSize": 14,
        "percentPrecision": 0,
        "labelRadius": 25,
        "creditsPosition": "bottom-left",
        "radius": "30%",
        "outlineAlpha": 1,
        "dataProvider": dataProvider,
        "startDuration": 0,
        "export": {
          "enabled": true,
          "libs": {
            "autoLoad": false
          },
          "menu": [{
            "class": "export-main",
            "label": $translate.instant('reportsPage.downloadOptions'),
            "menu": [{
              "label": $translate.instant('reportsPage.saveAs'),
              "title": $translate.instant('reportsPage.saveAs'),
              "class": "export-list",
              "menu": ["PNG", "JPG", "PDF"]
            }, 'PRINT']
          }]
        }
      });
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
      var dataProvider = data.dataProvider;
      var balloonText = metricsBalloonText;
      if (data.dummy) {
        balloonText = "";
      }

      return createDonutChart(metricsGraphDiv, balloonText, metricsLabelText, dataProvider);
    }
  }
})();
