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

    // variables for the active users section
    var activeUserDiv = 'activeUsersdiv';
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var activeUsersBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var usersTitle = $translate.instant('activeUsers.users');
    var activeUsersTitle = $translate.instant('activeUsers.activeUsers');

    var mediaQualityDiv = 'mediaQualityDiv';

    var activeUserPopulationChartId = 'activeUserPopulationChart';
    var customerPopBalloonText = "<span class='percent-label'>" + $translate.instant('activeUserPopulation.averageLabel') + "</span><br><span class='percent-large'>[[percentage]]%</span>";
    var populationBalloonText = "<span class='percent-label'>" + $translate.instant('activeUserPopulation.averageLabel') + '<br>' + $translate.instant('activeUserPopulation.acrossCustomers') + "</span><br><span class='percent-large'>[[overallPopulation]]%</span>";

    return {
      createActiveUsersGraph: createActiveUsersGraph,
      updateActiveUsersGraph: updateActiveUsersGraph,
      createMediaQualityGraph: createMediaQualityGraph,
      updateMediaQualityGraph: updateMediaQualityGraph,
      createActiveUserPopulationGraph: createActiveUserPopulationGraph,
      updateActiveUserPopulationGraph: updateActiveUserPopulationGraph,
    };

    function createGraph(data, div, graphs, valueAxes, catAxis, categoryField, legend, numFormat, chartCursor, startDuration) {
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
        'export': {
          "enabled": true,
          "menu": [{
            "class": "export-main",
            "label": "Download Options",
            "menu": [{
              "label": "Save As",
              "title": "Save As",
              "menu": ["PNG", "JPG", "PDF"]
            }, 'PRINT']
          }]
        }
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

      return createGraph(data, activeUserDiv, graphs, valueAxes, catAxis, 'modifiedDate', legend, angular.copy(numFormatBase), startDuration);
    }

    function activeUserGraphs(data) {
      var graphOne = angular.copy(columnBase);
      graphOne.title = usersTitle;
      graphOne.fillColors = 'colorOne';
      graphOne.colorField = 'colorOne';
      graphOne.legendColor = data[0].colorOne;
      graphOne.valueField = 'totalRegisteredUsers';
      graphOne.balloonText = activeUsersBalloonText;
      graphOne.showBalloon = data[0].balloon;

      var graphTwo = angular.copy(columnBase);
      graphTwo.title = activeUsersTitle;
      graphTwo.fillColors = 'colorTwo';
      graphTwo.colorField = 'colorTwo';
      graphTwo.legendColor = data[0].colorTwo;
      graphTwo.valueField = 'activeUsers';
      graphTwo.balloonText = activeUsersBalloonText;
      graphTwo.showBalloon = data[0].balloon;
      graphTwo.clustered = false;

      return [graphOne, graphTwo];
    }

    function updateActiveUsersGraph(data, activeUsersChart) {
      if (activeUsersChart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          return;
        }
        var startDuration = 1;
        if (data[0].colorOne === Config.chartColors.dummyGrayLight) {
          startDuration = 0;
        }

        activeUsersChart.dataProvider = data;
        activeUsersChart.graphs = activeUserGraphs(data);
        activeUsersChart.startDuration = startDuration;
        activeUsersChart.validateData();
      }
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
      valueAxes[0].stackType = 'regular';
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;
      valueAxes[0].title = $translate.instant('mediaQuality.minutes');

      var legend = angular.copy(legendBase);
      legend.reversedOrder = true;

      var startDuration = 1;
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        startDuration = 0;
      }

      var numFormat = angular.copy(numFormatBase);
      return createGraph(data, mediaQualityDiv, graphs, valueAxes, catAxis, 'modifiedDate', legend, numFormat, startDuration);
    }

    function mediaQualityGraphs(data) {
      var titles = ['mediaQuality.poor', 'mediaQuality.fair', 'mediaQuality.good'];
      var values = ['poorQualityDurationSum', 'fairQualityDurationSum', 'goodQualityDurationSum'];
      var colors = [Config.chartColors.brandDanger, Config.chartColors.brandWarning, Config.chartColors.blue];
      if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
        colors = [data[0].colorOne, data[0].colorTwo, data[0].colorThree];
      }
      var graphs = [];

      for (var i = 0; i < values.length; i++) {
        graphs[i] = angular.copy(columnBase);
        graphs[i].title = $translate.instant(titles[i]);
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].fontSize = 14;
        graphs[i].legendColor = colors[i];
        graphs[i].showBalloon = data[0].balloon;
        graphs[i].balloonText = '<span class="graph-text-balloon graph-number-color">' + $translate.instant('mediaQuality.totalCalls') + ': ' + ' <span class="graph-number">[[totalDurationSum]]</span></span>' + '<br><span class="graph-text-balloon graph-number-color">' + $translate.instant(titles[i]) + ': ' + '<span class="graph-number"> [[' + values[i] + ']]</span></span>';
        if (i) {
          graphs[i].clustered = false;
        }
      }

      return graphs;
    }

    function updateMediaQualityGraph(data, mediaQualityChart) {
      if (mediaQualityChart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          return;
        }
        var startDuration = 1;
        if (data[0].colorOne !== undefined && data[0].colorOne !== null) {
          startDuration = 0;
        }

        mediaQualityChart.dataProvider = data;
        mediaQualityChart.graphs = mediaQualityGraphs(data);
        mediaQualityChart.startDuration = startDuration;
        mediaQualityChart.validateData();
      }
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
      if (data[0].colorTwo === Config.chartColors.dummyGray) {
        startDuration = 0;
      }

      return createGraph(data, activeUserPopulationChartId, graphs, valueAxes, categoryAxis, 'customerName', null, null, chartCursor, startDuration);
    }

    function populationGraphs(data) {
      var graph = angular.copy(columnBase);
      graph.type = 'column';
      graph.fillColors = 'colorOne';
      graph.colorField = 'colorOne';
      graph.balloonColor = Config.chartColors.grayLight;
      graph.fontSize = 26;
      graph.valueField = 'percentage';
      graph.columnWidth = 0.8;
      graph.balloonText = customerPopBalloonText;
      graph.showBalloon = data[0].balloon;

      var graphTwo = {
        'type': 'step',
        'valueField': 'overallPopulation',
        'lineThickness': 2,
        'lineColor': data[0].colorTwo,
        'balloonColor': Config.chartColors.grayLight,
        'balloonText': populationBalloonText,
        'showBalloon': data[0].balloon,
        "animationPlayed": true
      };

      return [graph, graphTwo];
    }

    function updateActiveUserPopulationGraph(data, activeUserPopulationChart, overallPopulation) {
      if (activeUserPopulationChart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          return;
        }

        var startDuration = 1;
        if (data[0].colorTwo === Config.chartColors.dummyGray) {
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

        activeUserPopulationChart.dataProvider = modifyPopulation(data, overallPopulation);
        activeUserPopulationChart.graphs = populationGraphs(data);
        activeUserPopulationChart.startDuration = startDuration;
        activeUserPopulationChart.valueAxes = valueAxes;
        activeUserPopulationChart.validateData();
      }

      return activeUserPopulationChart;
    }

    function modifyPopulation(data, overallPopulation) {
      if (angular.isArray(data)) {
        angular.forEach(data, function (item) {
          var comparison = item.percentage - overallPopulation;
          item.absCompare = Math.abs(comparison);
          item.overallPopulation = overallPopulation;
          if (item.colorOne === null || item.colorOne === undefined) {
            item.labelColorField = Config.chartColors.grayDarkest;
            if (comparison >= 0) {
              item.colorOne = Config.chartColors.brandInfo;
            } else {
              item.colorOne = Config.chartColors.brandDanger;
            }
            item.balloon = true;
            item.colorTwo = Config.chartColors.blue;
          } else {
            item.labelColorField = Config.chartColors.grayLight;
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

  }
})();
