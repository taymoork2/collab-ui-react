(function () {
  'use strict';

  angular.module('Core')
    .service('GraphService', GraphService);

  /* @ngInject */
  function GraphService($translate, CommonGraphService, chartColors) {
    // Keys for base variables in CommonGraphService
    var COLUMN = 'column';
    var AXIS = 'axis';
    var LEGEND = 'legend';
    var NUMFORMAT = 'numFormat';

    // variables for the active users section
    var activeUserDiv = 'activeUsersdiv';
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var activeUsersBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var usersTitle = $translate.instant('activeUsers.users');
    var activeUsersTitle = $translate.instant('activeUsers.activeUsers');

    // variables for media quality
    var mediaQualityDiv = 'mediaQualityDiv';

    // variables for active user population
    var activePopDiv = 'activeUserPopulationChart';
    var popBalloonTextOne = "<span class='percent-label'>" + $translate.instant('activeUserPopulation.averageLabel') + "</span><br><span class='percent-large'>[[percentage]]%</span>";
    var popBalloonTextTwo = "<span class='percent-label'>" + $translate.instant('activeUserPopulation.averageLabel') + '<br>' + $translate.instant('activeUserPopulation.acrossCustomers') + "</span><br><span class='percent-large'>[[overallPopulation]]%</span>";

    // variables for the call metrics section
    var callMetricsDiv = 'callMetricsDiv';
    var callMetricsBalloonText = '<div class="donut-hover-text">[[label]]<br>[[numCalls]] ' + $translate.instant('callMetrics.calls') + ' ([[percents]]%)</div>';
    var callMetricsLabelText = '[[percents]]%<br>[[label]]';

    return {
      getActiveUsersGraph: getActiveUsersGraph,
      getMediaQualityGraph: getMediaQualityGraph,
      getActiveUserPopulationGraph: getActiveUserPopulationGraph,
      getCallMetricsDonutChart: getCallMetricsDonutChart
    };

    function getActiveUsersGraph(data, chart) {
      if (angular.isDefined(chart) && chart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          return;
        }
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }

        chart.dataProvider = data;
        chart.graphs = activeUserGraphs(data);
        chart.startDuration = startDuration;
        chart.validateData();
      } else {
        chart = createActiveUsersGraph(data);
      }
      return chart;
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

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, activeUserGraphs(data), 'modifiedDate', catAxis);
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

    function getMediaQualityGraph(data, chart) {
      if (angular.isDefined(chart) && chart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          return;
        }
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }

        chart.dataProvider = data;
        chart.graphs = mediaQualityGraphs(data);
        chart.startDuration = startDuration;
        chart.validateData();
      } else {
        chart = createMediaQualityGraph(data);
      }
      return chart;
    }

    function createMediaQualityGraph(data) {
      if (data.length === 0) {
        return;
      }

      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';

      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[0].totalColor = chartColors.brandWhite;
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;
      valueAxes[0].title = $translate.instant('mediaQuality.minutes');

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, mediaQualityGraphs(data), 'modifiedDate', catAxis);
      chartData.numberFormatter = CommonGraphService.getBaseVariable(NUMFORMAT);
      chartData.legend = CommonGraphService.getBaseVariable(LEGEND);
      chartData.legend.reversedOrder = true;

      return AmCharts.makeChart(mediaQualityDiv, chartData);
    }

    function mediaQualityGraphs(data) {
      var values = ['totalDurationSum', 'partialSum', 'poorQualityDurationSum'];
      var balloonValues = ['goodQualityDurationSum', 'fairQualityDurationSum', 'poorQualityDurationSum'];
      var titles = ['mediaQuality.good', 'mediaQuality.fair', 'mediaQuality.poor'];
      var colors = [chartColors.blue, chartColors.brandWarning, chartColors.brandDanger];
      if (!data[0].balloon) {
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
        graphs[i].balloonText = '<span class="graph-text-balloon graph-number-color">' + $translate.instant('mediaQuality.totalCalls') + ': ' + ' <span class="graph-number">[[totalDurationSum]]</span></span>' + '<br><span class="graph-text-balloon graph-number-color">' + $translate.instant(titles[i]) + ': ' + '<span class="graph-number"> [[' + values[i] + ']]</span></span>';
        graphs[i].clustered = false;
      }

      return graphs;
    }

    function getActiveUserPopulationGraph(data, chart, overallPopulation) {
      if (angular.isDefined(chart) && chart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          return;
        }

        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }

        var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
        valueAxes[0].autoGridCount = false;
        valueAxes[0].minimum = 0;
        valueAxes[0].maximum = 100;
        valueAxes[0].unit = "%";

        if (data[0].percentage > overallPopulation && data[0].percentage > 100) {
          valueAxes[0].maximum = data[0].percentage;
        } else if (overallPopulation > 100) {
          valueAxes[0].maximum = overallPopulation;
        }

        chart.dataProvider = modifyPopulation(data, overallPopulation);
        chart.graphs = populationGraphs(data);
        chart.startDuration = startDuration;
        chart.valueAxes = valueAxes;
        chart.validateData();
      } else {
        chart = createActiveUserPopulationGraph(data, overallPopulation);
      }

      return chart;
    }

    function createActiveUserPopulationGraph(data, overallPopulation) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }

      data = modifyPopulation(data, overallPopulation);
      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.axisAlpha = 0;
      catAxis.fontSize = 15;
      catAxis.autoWrap = true;
      catAxis.labelColorField = "labelColorField";

      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[0].autoGridCount = false;
      valueAxes[0].minimum = 0;
      valueAxes[0].maximum = 100;
      valueAxes[0].unit = "%";
      if (data[1].percentage > overallPopulation && data[1].percentage > 100) {
        valueAxes[0].maximum = data[1].percentage;
      } else if (overallPopulation > 100) {
        valueAxes[0].maximum = overallPopulation;
      }

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var chartData = CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, populationGraphs(data), 'customerName', catAxis);
      chartData.marginBottom = 60;
      chartData.chartCursor = {
        "cursorAlpha": 0,
        "categoryBalloonEnabled": false,
        "oneBalloonOnly": true,
        "balloonPointerOrientation": "vertical",
        "showNextAvailable": true
      };

      return AmCharts.makeChart(activePopDiv, chartData);
    }

    function populationGraphs(data) {
      var graph = CommonGraphService.getBaseVariable(COLUMN);
      graph.fillColors = 'colorOne';
      graph.colorField = 'colorOne';
      graph.fontSize = 26;
      graph.valueField = 'percentage';
      graph.columnWidth = 0.8;
      graph.balloonText = popBalloonTextOne;
      graph.showBalloon = data[0].balloon;

      var graphs = [graph, {
        'type': 'step',
        'valueField': 'overallPopulation',
        'lineThickness': 2,
        'lineColor': data[0].colorTwo,
        'balloonColor': chartColors.grayLight,
        'balloonText': popBalloonTextTwo,
        'showBalloon': data[0].balloon,
        "animationPlayed": true
      }];

      return graphs;
    }

    function modifyPopulation(data, overallPopulation) {
      if (angular.isArray(data)) {
        angular.forEach(data, function (item) {
          item.overallPopulation = overallPopulation;
          if (item.colorOne === null || item.colorOne === undefined) {
            if ((item.percentage - overallPopulation) >= 0) {
              item.colorOne = chartColors.brandInfo;
            } else {
              item.colorOne = chartColors.brandDanger;
            }
            item.colorTwo = chartColors.blue;
          }
        });

        if (data.length === 1) {
          var dummy = {
            colorOne: chartColors.brandWhite,
            colorTwo: data[0].colorTwo,
            balloon: data[0].balloon,
            labelColorField: chartColors.brandWhite,
            overallPopulation: overallPopulation
          };
          data.unshift(angular.copy(dummy));
          data.push(angular.copy(dummy));
        }
      }

      return data;
    }

    function getCallMetricsDonutChart(data, chart) {
      if (angular.isDefined(chart) && chart !== null && angular.isArray(data.dataProvider) && data.dataProvider.length === 2) {
        if (!angular.isArray(data) && data.length !== 0) {
          var balloonText = callMetricsBalloonText;
          var labelsEnabled = true;
          var textColor = chartColors.grayDarkest;
          if (data.dummy) {
            balloonText = "";
            labelsEnabled = false;
            textColor = chartColors.brandWhite;
          }

          chart.dataProvider = data.dataProvider;
          chart.allLabels = getCallMetricsLabels(data.labelData);
          chart.balloonText = balloonText;
          chart.labelsEnabled = labelsEnabled;
          chart.color = textColor;
          chart.labelColorField = textColor;
          chart.validateNow(true, false);
        }
      } else {
        chart = createCallMetricsDonutChart(data);
      }
      return chart;
    }

    function createCallMetricsDonutChart(data) {
      if (!angular.isArray(data.dataProvider) || data.dataProvider.length !== 2) {
        return;
      }

      var balloonText = callMetricsBalloonText;
      var labelsEnabled = true;
      var textColor = chartColors.grayDarkest;
      if (data.dummy) {
        balloonText = "";
        labelsEnabled = false;
        textColor = chartColors.brandWhite;
      }

      var chartData = CommonGraphService.getBasePieChart(data.dataProvider, balloonText, "75%", "30%", callMetricsLabelText, labelsEnabled, "label", "value", "color", textColor);
      chartData.color = textColor;
      chartData.labelColorField = textColor;
      chartData.allLabels = getCallMetricsLabels(data.labelData);
      chartData.color = textColor;

      return AmCharts.makeChart(callMetricsDiv, chartData);
    }

    function getCallMetricsLabels(data) {
      return [{
        "align": "center",
        "size": "42",
        "text": data.numTotalCalls,
        "y": 112
      }, {
        "align": "center",
        "size": "16",
        "text": $translate.instant('callMetrics.totalCalls'),
        "y": 162
      }, {
        "align": "center",
        "size": "30",
        "text": data.numTotalMinutes,
        "y": 197
      }, {
        "align": "center",
        "size": "16",
        "text": $translate.instant('callMetrics.totalCallMinutes'),
        "y": 232
      }];
    }
  }
})();
