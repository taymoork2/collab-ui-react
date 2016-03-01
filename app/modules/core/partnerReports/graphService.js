(function () {
  'use strict';

  angular.module('Core')
    .service('GraphService', GraphService);

  /* @ngInject */
  function GraphService($translate, Config) {
    // Base variables for building grids and charts
    var columnBase = {
      'type': 'column',
      'fillAlphas': 1,
      'lineAlpha': 0,
      'balloonColor': Config.chartColors.grayLight,
      'columnWidth': 0.6
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
    var numFormatBase = {
      'precision': 0,
      'decimalSeparator': '.',
      'thousandsSeparator': ','
    };
    var defaultBalloon = {
      'adjustBorderColor': true,
      'borderThickness': 1,
      'fillAlpha': 1,
      'fillColor': Config.chartColors.brandWhite,
      'fixedPosition': true,
      'shadowAlpha': 0
    };
    var exportMenu = {
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
    };

    // variables for the active users section
    var activeUserDiv = 'activeUsersdiv';
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var activeUsersBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var usersTitle = $translate.instant('activeUsers.users');
    var activeUsersTitle = $translate.instant('activeUsers.activeUsers');

    // variables for media quality
    var mediaQualityDiv = 'mediaQualityDiv';

    // variables for active user population
    var activeUserPopulationChartId = 'activeUserPopulationChart';
    var popBalloonTextOne = "<span class='percent-label'>" + $translate.instant('activeUserPopulation.averageLabel') + "</span><br><span class='percent-large'>[[percentage]]%</span>";
    var popBalloonTextTwo = "<span class='percent-label'>" + $translate.instant('activeUserPopulation.averageLabel') + '<br>' + $translate.instant('activeUserPopulation.acrossCustomers') + "</span><br><span class='percent-large'>[[overallPopulation]]%</span>";

    // variables for the call metrics section
    var callMetricsDiv = 'callMetricsDiv';
    var callMetricsBalloonText = '<div class="donut-hover-text">[[callCondition]]<br>[[numCalls]] ' + $translate.instant('callMetrics.calls') + ' ([[percents]]%)</div>';
    var callMetricsLabelText = '[[percents]]%<br>[[callCondition]]';

    return {
      getActiveUsersGraph: getActiveUsersGraph,
      getMediaQualityGraph: getMediaQualityGraph,
      getActiveUserPopulationGraph: getActiveUserPopulationGraph,
      getCallMetricsDonutChart: getCallMetricsDonutChart
    };

    function createGraph(data, div, graphs, valueAxes, catAxis, categoryField, legend, numFormat, chartCursor, startDuration, marginBottom) {
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
        'balloon': angular.copy(defaultBalloon),
        'autoMargins': false,
        'marginLeft': 60,
        'marginTop': 60,
        'marginRight': 60,
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
        'export': angular.copy(exportMenu)
      };

      if (angular.isDefined(legend) && legend !== null) {
        chartData.legend = legend;
      }
      if (angular.isDefined(numFormat) && numFormat !== null) {
        chartData.numberFormatter = numFormat;
      }

      if (angular.isDefined(chartCursor) && chartCursor !== null) {
        chartData.chartCursor = chartCursor;
      }

      if (angular.isDefined(marginBottom) && marginBottom !== null) {
        chartData.marginBottom = marginBottom;
      }

      return AmCharts.makeChart(div, chartData);
    }

    function getActiveUsersGraph(data, chart) {
      if (angular.isDefined(chart) && chart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          return;
        }
        var startDuration = 1;
        if (data[0].colorOne === Config.chartColors.dummyGrayLight) {
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

      return createGraph(data, activeUserDiv, graphs, valueAxes, catAxis, 'modifiedDate', legend, angular.copy(numFormatBase), null, startDuration);
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

      var graphs = mediaQualityGraphs(data);
      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].totalColor = Config.chartColors.brandWhite;
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;
      valueAxes[0].title = $translate.instant('mediaQuality.minutes');

      var legend = angular.copy(legendBase);
      legend.reversedOrder = true;

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      return createGraph(data, mediaQualityDiv, graphs, valueAxes, catAxis, 'modifiedDate', legend, angular.copy(numFormatBase), null, startDuration);
    }

    function mediaQualityGraphs(data) {
      var values = ['totalDurationSum', 'partialSum', 'poorQualityDurationSum'];
      var balloonValues = ['goodQualityDurationSum', 'fairQualityDurationSum', 'poorQualityDurationSum'];
      var titles = ['mediaQuality.good', 'mediaQuality.fair', 'mediaQuality.poor'];
      var colors = [Config.chartColors.blue, Config.chartColors.brandWarning, Config.chartColors.brandDanger];
      if (!data[0].balloon) {
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

        var valueAxes = [angular.copy(axis)];
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
      var graphs = populationGraphs(data);

      var categoryAxis = angular.copy(axis);
      categoryAxis.axisAlpha = 0;
      categoryAxis.fontSize = 15;
      categoryAxis.autoWrap = true;
      categoryAxis.labelColorField = "labelColorField";

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].autoGridCount = false;
      valueAxes[0].minimum = 0;
      valueAxes[0].maximum = 100;
      valueAxes[0].unit = "%";

      if (data[1].percentage > overallPopulation && data[1].percentage > 100) {
        valueAxes[0].maximum = data[1].percentage;
      } else if (overallPopulation > 100) {
        valueAxes[0].maximum = overallPopulation;
      }

      var chartCursor = {
        "cursorAlpha": 0,
        "categoryBalloonEnabled": false,
        "oneBalloonOnly": true,
        "balloonPointerOrientation": "vertical",
        "showNextAvailable": true
      };

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      return createGraph(data, activeUserPopulationChartId, graphs, valueAxes, categoryAxis, 'customerName', null, null, chartCursor, startDuration, 60);
    }

    function populationGraphs(data) {
      var graph = angular.copy(columnBase);
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
        'balloonColor': Config.chartColors.grayLight,
        'balloonText': popBalloonTextTwo,
        'showBalloon': data[0].balloon,
        "animationPlayed": true
      }];

      return graphs;
    }

    function modifyPopulation(data, overallPopulation) {
      if (angular.isArray(data)) {
        angular.forEach(data, function (item) {
          var comparison = item.percentage - overallPopulation;
          item.absCompare = Math.abs(comparison);
          item.overallPopulation = overallPopulation;
          if (item.colorOne === null || item.colorOne === undefined) {
            if (comparison >= 0) {
              item.colorOne = Config.chartColors.brandInfo;
            } else {
              item.colorOne = Config.chartColors.brandDanger;
            }
            item.colorTwo = Config.chartColors.blue;
          }
        });

        if (data.length === 1) {
          var dummy = {
            colorOne: Config.chartColors.brandWhite,
            colorTwo: data[0].colorTwo,
            balloon: data[0].balloon,
            labelColorField: Config.chartColors.brandWhite,
            overallPopulation: overallPopulation
          };
          data.unshift(angular.copy(dummy));
          data.push(angular.copy(dummy));
        }
      }

      return data;
    }

    // Donut Graphs below here
    function createDonutChart(div, balloonText, labelText, textColor, centerLabel, labelsEnabled, dataProvider) {
      return AmCharts.makeChart(div, {
        "type": "pie",
        "balloonText": balloonText,
        "balloon": angular.copy(defaultBalloon),
        "innerRadius": "75%",
        "labelText": labelText,
        "color": textColor,
        "colorField": "color",
        "labelColorField": textColor,
        "titleField": "label",
        "valueField": "value",
        "fontFamily": "Arial",
        "fontSize": 14,
        "percentPrecision": 0,
        "labelRadius": 25,
        "creditsPosition": "bottom-left",
        "radius": "30%",
        "outlineAlpha": 1,
        "dataProvider": dataProvider,
        "startDuration": 0,
        "allLabels": centerLabel,
        "labelsEnabled": labelsEnabled,
        "export": angular.copy(exportMenu)
      });
    }

    function getCallMetricsDonutChart(data, chart) {
      if (angular.isDefined(chart) && chart !== null && angular.isArray(data.dataProvider) && data.dataProvider.length === 2) {
        if (!angular.isArray(data) && data.length !== 0) {
          var balloonText = callMetricsBalloonText;
          var labelsEnabled = true;
          var textColor = Config.chartColors.grayDarkest;
          if (data.dummy) {
            balloonText = "";
            labelsEnabled = false;
            textColor = Config.chartColors.brandWhite;
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
      var textColor = Config.chartColors.grayDarkest;
      if (data.dummy) {
        balloonText = "";
        labelsEnabled = false;
        textColor = Config.chartColors.brandWhite;
      }

      return createDonutChart(callMetricsDiv, balloonText, callMetricsLabelText, textColor, getCallMetricsLabels(data.labelData), labelsEnabled, data.dataProvider);
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
