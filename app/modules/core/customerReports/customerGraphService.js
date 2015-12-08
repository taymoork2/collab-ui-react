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
    var activeUsersBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var usersTitle = $translate.instant('activeUsers.users');
    var activeUsersTitle = $translate.instant('activeUsers.activeUsers');

    return {
      setActiveUsersGraph: setActiveUsersGraph
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
        }]
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

    function setActiveUsersGraph(data, activeUsersChart) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (activeUsersChart !== null) {
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

  }
})();
