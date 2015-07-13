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
      'gridAlpha': 0,
      'axisAlpha': 1,
      'tickLength': 0,
      'color': Config.chartColors.grayDarkest
    };
    var legendBase = {
      'align': 'center',
      'autoMargins': false,
      'switchable': false,
      'fontSize': 13,
      'color': Config.chartColors.grayDarkest,
      'markerLabelGap': 10,
      'markerType': 'square',
      'markerSize': 10,
      'position': 'bottom'
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

    return {
      createActiveUsersGraph: createActiveUsersGraph,
      updateActiveUsersGraph: updateActiveUsersGraph,
      createMediaQualityGraph: createMediaQualityGraph,
      updateMediaQualityGraph: updateMediaQualityGraph,
      createActiveUserPopulationGraph: createActiveUserPopulationGraph,
      updateActiveUserPopulationGraph: updateActiveUserPopulationGraph,
    };

    function createGraph(data, div, graphs, valueAxes, catAxis, categoryField, legend, numFormat) {

      var chartData = {
        'type': 'serial',
        'addClassNames': true,
        'fontFamily': 'Arial',
        'backgroundColor': Config.chartColors.brandWhite,
        'backgroundAlpha': 1,
        "dataProvider": data,
        "valueAxes": valueAxes,
        "graphs": graphs,
        'balloon': {
          'adjustBorderColor': true,
          'borderThickness': 1,
          'fillAlpha': 1,
          'fillColor': Config.chartColors.brandWhite,
          'fixedPosition': true,
          'shadowAlpha': 0
        },
        'plotAreaBorderAlpha': 0,
        'plotAreaBorderColor': Config.chartColors.grayLight,
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
        }]
      };

      if (legend != null) {
        chartData.legend = legend;
      }
      if (numFormat != null) {
        chartData.numberFormatter = numFormat;
      }

      return AmCharts.makeChart(div, chartData);
    }

    function dummyData(div, overallPopulation) {
      var dataPoint = {
        "modifiedDate": ""
      };

      if (div === activeUserDiv) {
        dataPoint.totalRegisteredUsers = 0;
        dataPoint.activeUsers = 0;
        dataPoint.percentage = 0;
      }
      if (div === mediaQualityDiv) {
        dataPoint.excellent = 0;
        dataPoint.good = 0;
        dataPoint.fair = 0;
        dataPoint.poor = 0;
        dataPoint.totalCalls = 0;
      }
      if (div === activeUserPopulationChartId) {
        dataPoint.customerName = "  ";
        dataPoint.percentage = 0;
        dataPoint.color = Config.chartColors.brandWhite;
        dataPoint.top = 0;
        dataPoint.bottom = 0;
        dataPoint.labelColorField = Config.chartColors.brandWhite;
        if (overallPopulation !== null && overallPopulation !== undefined) {
          dataPoint.overallPopulation = overallPopulation;
        } else {
          dataPoint.overallPopulation = 0;
        }
      }
      return [dataPoint];
    }

    function createActiveUsersGraph(data) {
      // if there are no active users for this user
      if (data.length === 0) {
        data = dummyData(activeUserDiv);
      }
      var graphOne = angular.copy(columnBase);
      graphOne.title = usersTitle;
      graphOne.fillColors = Config.chartColors.brandSuccessLight;
      graphOne.colorField = Config.chartColors.brandSuccessLight;
      graphOne.valueField = 'totalRegisteredUsers';
      graphOne.balloonText = activeUsersBalloonText;

      var graphTwo = angular.copy(columnBase);
      graphTwo.title = activeUsersTitle;
      graphTwo.fillColors = Config.chartColors.brandSuccessDark;
      graphTwo.colorField = Config.chartColors.brandSuccessDark;
      graphTwo.valueField = 'activeUsers';
      graphTwo.balloonText = activeUsersBalloonText;
      graphTwo.clustered = false;

      var graphs = [graphOne, graphTwo];
      var valueAxes = [angular.copy(axis)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var legend = angular.copy(legendBase);
      legend.labelText = '[[title]]';
      var numFormat = angular.copy(numFormatBase);

      return createGraph(data, activeUserDiv, graphs, valueAxes, catAxis, 'modifiedDate', legend, numFormat);
    }

    function updateActiveUsersGraph(data, activeUsersChart) {
      if (activeUsersChart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          activeUsersChart.dataProvider = dummyData(activeUserDiv);
        } else {
          activeUsersChart.dataProvider = data;
        }
        activeUsersChart.validateData();
      }
    }

    function createMediaQualityGraph(data) {
      var mediaQualityBalloonText = '<span class="graph-text-balloon graph-number-color">' + $translate.instant('mediaQuality.totalCalls') + ': ' + ' <span class="graph-number">[[totalCalls]]</span></span>';
      var titles = ['mediaQuality.poor', 'mediaQuality.fair', 'mediaQuality.good', 'mediaQuality.excellent'];
      var values = ['poor', 'fair', 'good', 'excellent'];
      var colors = [Config.chartColors.brandDanger, Config.chartColors.brandWarning, Config.chartColors.blue, Config.chartColors.brandInfo];
      var graphs = [];

      if (data.data.length === 0) {
        data = dummyData(mediaQualityDiv);
      } else {
        data = data.data[0].data;
      }

      for (var i = 0; i < values.length; i++) {
        graphs[i] = angular.copy(columnBase);
        graphs[i].title = $translate.instant(titles[i]);
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].labelText = '[[value]]';
        graphs[i].fontSize = 14;
        graphs[i].legendColor = colors[i];
        graphs[i].balloonText = mediaQualityBalloonText + '<br><span class="graph-text-balloon graph-number-color">' + $translate.instant(titles[i]) + ': ' + '<span class="graph-number"> [[value]]</span></span>';
        if (i) {
          graphs[i].clustered = false;
        }
      }

      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].totalColor = Config.chartColors.brandWhite;
      valueAxes[0].labelsEnabled = false;
      valueAxes[0].stackType = 'regular';
      valueAxes[0].axisAlpha = 0;

      var legend = angular.copy(legendBase);
      legend.autoMargins = false;
      legend.equalWidths = false;
      legend.horizontalGap = 5;
      legend.valueAlign = 'left';
      legend.valueWidth = 0;
      legend.verticalGap = 20;
      legend.reversedOrder = true;

      var numFormat = angular.copy(numFormatBase);
      return createGraph(data, mediaQualityDiv, graphs, valueAxes, catAxis, 'modifiedDate', legend, numFormat);
    }

    function updateMediaQualityGraph(data, mediaQualityChart) {
      if (mediaQualityChart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          mediaQualityChart.dataProvider = dummyData(mediaQualityDiv);
        } else {
          mediaQualityChart.dataProvider = data;
        }
        mediaQualityChart.validateData();
      }
    }

    function createActiveUserPopulationGraph(data, overallPopulation) {
      if (data === null || data === 'undefined' || data.length === 0) {
        data = dummyData(activeUserPopulationChartId, overallPopulation);
      } else {
        data = modifyPopulation(data, overallPopulation);
      }

      var graph = angular.copy(columnBase);
      graph.type = 'column';
      graph.fillColors = 'color';
      graph.colorField = 'color';
      graph.labelColorField = 'color';
      graph.labelText = '[[percentage]]%';
      graph.fontSize = 26;
      graph.balloonText = '<span class="graph-text"><span class="graph-population" style="color:[[color]];">[[absCompare]]%</span> [[balloonText]]</span>';
      graph.valueField = 'top';
      graph.openField = 'bottom';
      graph.columnWidth = 0.8;

      var graphTwo = {
        'type': 'step',
        'valueField': 'overallPopulation',
        'lineThickness': 1,
        'lineColor': Config.chartColors.grayLight,
        'balloonColor': Config.chartColors.grayLight
      };

      var graphs = [graph, graphTwo];

      var categoryAxis = angular.copy(axis);
      categoryAxis.axisAlpha = 0;
      categoryAxis.fontSize = 15;
      categoryAxis.autoWrap = true;
      categoryAxis.labelColorField = "labelColorField";

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].labelsEnabled = false;
      valueAxes[0].autoGridCount = false;
      valueAxes[0].axisAlpha = 0;
      valueAxes[0].minimum = 0;
      valueAxes[0].maximum = 100;

      return createGraph(data, activeUserPopulationChartId, graphs, valueAxes, categoryAxis, 'customerName', null, null);
    }

    function updateActiveUserPopulationGraph(data, activeUserPopulationChart, overallPopulation) {
      if (activeUserPopulationChart !== null) {
        if (data === null || data === 'undefined' || data.length === 0) {
          activeUserPopulationChart.dataProvider = dummyData(activeUserPopulationChartId, overallPopulation);
        } else {
          activeUserPopulationChart.dataProvider = modifyPopulation(data, overallPopulation);
        }
        activeUserPopulationChart.validateData();
      }

      return activeUserPopulationChart;
    }

    function modifyPopulation(data, overallPopulation) {

      if (angular.isArray(data)) {
        angular.forEach(data, function (item) {
          var comparison = item.percentage - overallPopulation;
          item.absCompare = Math.abs(comparison);
          item.labelColorField = Config.chartColors.grayDarkest;
          item.overallPopulation = overallPopulation;
          if (comparison >= 0) {
            item.top = item.percentage;
            item.bottom = overallPopulation;
            item.color = Config.chartColors.brandInfo;
            item.balloonText = $translate.instant('activeUserPopulation.aboveAverage');
          } else {
            item.top = overallPopulation;
            item.bottom = item.percentage;
            item.color = Config.chartColors.brandDanger;
            item.balloonText = $translate.instant('activeUserPopulation.belowAverage');
          }
        });

        if (data.length === 1) {
          var dummy = dummyData(activeUserPopulationChartId, overallPopulation);
          data.unshift(angular.copy(dummy[0]));
          data.push(angular.copy(dummy[0]));
        }
      }

      return data;
    }

  }
})();
