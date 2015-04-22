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
      'balloonColor': Config.chartColors.grayLight
    };
    var axis = {
      'axisColor': Config.chartColors.grayLight,
      'gridAlpha': 0,
      'axisAlpha': 1,
      'tickLength': 0,
      'color': Config.chartColors.grayDarkest
    };
    var legendBase = {
      'align': 'center',
      'marginTop': 15,
      'autoMargins': false,
      'switchable': false,
      'fontSize': 13,
      'color': Config.chartColors.grayDarkest,
      'markerLabelGap': 10
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
    var activeUsersGraph = null;

    return {
      createActiveUserGraph: createActiveUserGraph,
      invalidateActiveUserGraphSize: invalidateActiveUserGraphSize,
      updateActiveUsersGraph: updateActiveUsersGraph
    };

    function createActiveUserGraph(data) {
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

      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var legend = angular.copy(legendBase);
      legend.markerType = 'square';
      legend.labelText = '[[title]]';
      legend.position = 'bottom';

      var numFormat = angular.copy(numFormatBase);

      activeUsersGraph = createGraph(data, activeUserDiv, 'serial', graphs, valueAxes, catAxis, legend, numFormat);
    }

    function invalidateActiveUserGraphSize() {
      if (activeUsersGraph !== null) {
        activeUsersGraph.invalidateSize();
      }
    }

    function updateActiveUsersGraph(data) {
      if (activeUsersGraph === null) {
        createActiveUserGraph(data);
      } else {
        if (data.length === 0) {
          activeUsersGraph.dataProvider = dummyData(activeUserDiv);
        } else {
          activeUsersGraph.dataProvider = data;
        }

        activeUsersGraph.validateData();
        invalidateActiveUserGraphSize();
      }
    }

    function createGraph(data, div, chartType, graphs, valueAxes, catAxis, legend, numFormat) {
      return AmCharts.makeChart(div, {
        'type': chartType,
        'theme': 'none',
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
        'numberFormatter': numFormat,
        'plotAreaBorderAlpha': 0,
        'plotAreaBorderColor': Config.chartColors.grayLight,
        'marginTop': 20,
        'marginRight': 20,
        'marginLeft': 10,
        'marginBottom': 10,
        'categoryField': 'modifiedDate',
        'categoryAxis': catAxis,
        'legend': legend,
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
      });
    }

    function dummyData(div) {
      var dataPoint = {
        "modifiedDate": ""
      };

      if (div === activeUserDiv) {
        dataPoint.totalRegisteredUsers = 0;
        dataPoint.activeUsers = 0;
        dataPoint.percentage = 0;
      }

      return [dataPoint];
    }
  }
})();
