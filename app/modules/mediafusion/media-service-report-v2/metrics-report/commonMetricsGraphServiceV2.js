(function () {
  'use strict';

  angular.module('Mediafusion').service('CommonMetricsGraphServiceV2', CommonMetricsGraphServiceV2);
  /* @ngInject */
  function CommonMetricsGraphServiceV2($translate, chartColors) {
    var amchartsImages = './amcharts/images/';
    // Base variables for building grids and charts
    var baseVariables = [];
    baseVariables['column'] = {
      'type': 'column',
      'fillAlphas': 1,
      'lineAlpha': 0,
      'balloonColor': chartColors.grayLightTwo
    };
    baseVariables['smoothedLine'] = {
      'type': 'smoothedLine',
      'lineColor': chartColors.colorPurple,
      'lineThickness': 2,
      'balloonColor': chartColors.grayLightTwo,
      'negativeLineColor': chartColors.colorPurple,
      'negativeBase': 100,
    };
    baseVariables['line'] = {
      'type': 'line',
      'bullet': 'round',
      'fillAlphas': 0,
      'lineAlpha': 1,
      'lineThickness': 3,
      'hidden': false
    };
    baseVariables['axis'] = {
      'axisColor': chartColors.grayLightTwo,
      'gridColor': chartColors.grayLightTwo,
      'color': chartColors.grayDarkThree,
      'titleColor': chartColors.grayDarkThree,
      'fontFamily': 'CiscoSansTT Light',
      'gridAlpha': 0,
      'axisAlpha': 1,
      'tickLength': 0
    };
    baseVariables['guideaxis'] = {
      'axisColor': chartColors.grayLightTwo,
      'gridColor': chartColors.grayLightTwo,
      'color': chartColors.grayDarkThree,
      'titleColor': chartColors.grayDarkThree,
      'fontFamily': 'CiscoSansTT Light',
      'gridAlpha': 0,
      'axisAlpha': 1,
      'tickLength': 0
    };
    baseVariables['legend'] = {
      'color': chartColors.grayDarkThree,
      'autoMargins': false,
      'align': 'center',
      'position': 'bottom',
      'switchable': false,
      'fontSize': 13,
      'markerLabelGap': 10,
      'markerType': 'square',
      'markerSize': 10,
      'equalWidths': false,
      'horizontalGap': 5,
      'valueAlign': 'left',
      'valueWidth': 0,
      'verticalGap': 20
    };
    baseVariables['numFormat'] = {
      'precision': 0,
      'decimalSeparator': '.',
      'thousandsSeparator': ','
    };
    baseVariables['balloon'] = {
      'adjustBorderColor': true,
      'borderThickness': 1,
      'fillAlpha': 1,
      'fillColor': chartColors.brandWhite,
      'fixedPosition': true,
      'shadowAlpha': 0
    };
    baseVariables['export'] = {
      'enabled': true,
      'libs': {
        'autoLoad': false
      },
      'menu': [{
        'class': 'export-main',
        'label': $translate.instant('reportsPage.downloadOptions'),
        'menu': [{
          'label': $translate.instant('reportsPage.saveAs'),
          'title': $translate.instant('reportsPage.saveAs'),
          'class': 'export-list',
          'menu': ['PNG', 'JPG', 'PDF']
        }, 'PRINT']
      }]
    };
    baseVariables['prefixesOfBigNumbers'] = [{
      number: 1e+3,
      prefix: 'K'
    }, {
      number: 1e+6,
      prefix: 'M'
    }, {
      number: 1e+9,
      prefix: 'B'
    }, {
      number: 1e+12,
      prefix: 'T'
    }];
    baseVariables['chartScrollbar'] = {
      'offset': 30,
      'scrollbarHeight': 20,
      'backgroundAlpha': 0,
      'selectedBackgroundAlpha': 0.1,
      'selectedBackgroundColor': '#888888',
      'graphFillAlpha': 0,
      'graphLineAlpha': 0.5,
      'selectedGraphFillAlpha': 0,
      'selectedGraphLineAlpha': 1,
      'autoGridCount': true,
      'color': '#AAAAAA'
    };
    baseVariables['valueScrollbar'] = {
      'autoGridCount': true,
      'color': '#AAAAAA',
      'backgroundColor': '#ffffff',
      'backgroundAlpha': 1
    };
    return {
      getBaseVariable: getBaseVariable,
      getBaseStackSerialGraph: getBaseStackSerialGraph,
      getGanttGraph: getGanttGraph
    };

    function getBaseVariable(key) {
      if (baseVariables[key] !== null && !_.isUndefined(baseVariables[key])) {
        return angular.copy(baseVariables[key]);
      } else {
        return {};
      }
    }

    function getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, categoryField, catAxis, exportData, chartScrollbar) {
      return angular.copy({
        'type': 'serial',
        'pathToImages': amchartsImages,
        'startEffect': 'easeOutSine',
        'addClassNames': true,
        'fontFamily': 'CiscoSansTT Extra Light',
        'backgroundColor': chartColors.brandWhite,
        'backgroundAlpha': 1,
        'balloon': baseVariables['balloon'],
        "autoMarginOffset": 25,
        'marginLeft': 60,
        'marginTop': 60,
        'marginRight': 60,
        'usePrefixes': true,
        'prefixesOfBigNumbers': baseVariables['prefixesOfBigNumbers'],
        'export': exportData,
        'startDuration': startDuration,
        'dataProvider': data,
        'valueAxes': valueAxes,
        'graphs': graphs,
        'gridAboveGraphs': true,
        'categoryField': categoryField,
        'categoryAxis': catAxis,
        'mouseWheelZoomEnabled': false,
        "chartCursor": {
          "cursorColor": "#55bb76",
          "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
          "valueBalloonsEnabled": false,
          "cursorAlpha": 0,
          "valueLineAlpha": 0.5,
          "valueLineBalloonEnabled": true,
          "valueLineEnabled": true,
          "zoomable": true,
          "valueZoomable": false
        },
        'chartScrollbar': chartScrollbar
      });
    }

    function getGanttGraph(data, valueAxis, exportData, catAxis, valueScrollbar) {
      return angular.copy({
        'type': 'gantt',
        'pathToImages': amchartsImages,
        'theme': 'light',
        'marginRight': 70,
        'balloonDateFormat': 'JJ:NN',
        'columnWidth': 0.035,
        'valueAxis': valueAxis,
        'brightnessStep': 0,
        'fontFamily': 'CiscoSansTT Extra Light',
        'graph': {
          'fillAlphas': 1,
          'balloonText': '<b>[[availability]]</b></br><b>[[nodes]]</b>'
        },
        'rotate': true,
        'categoryField': 'category',
        'categoryAxis': catAxis,
        'segmentsField': 'segments',
        'colorField': 'color',
        'startField': 'start',
        'endField': 'end',
        'durationField': 'duration',
        'dataProvider': data,
        'valueScrollbar': valueScrollbar,
        'chartCursor': {
          'cursorColor': '#55bb76',
          'valueBalloonsEnabled': false,
          'cursorAlpha': 0,
          'valueLineAlpha': 0.5,
          'valueLineBalloonEnabled': true,
          'valueLineEnabled': true,
          'zoomable': false,
          'valueZoomable': true
        },
        'export': exportData
      });
    }
  }
})();
