(function () {
  'use strict';

  angular.module('Mediafusion').service('CommonReportsGraphService', CommonReportsGraphService);
  /* @ngInject */
  function CommonReportsGraphService($translate, $window, chartColors) {
    var amchartsImages = './amcharts/images/';
    // Base variables for building grids and charts
    var baseVariables = [];
    baseVariables['column'] = {
      'type': 'column',
      'fillAlphas': 1,
      'lineAlpha': 0,
      'balloonColor': chartColors.grayLight,
      'columnWidth': 4
    };
    baseVariables['smoothedLine'] = {
      'type': 'smoothedLine',
      'lineColor': chartColors.colorPurple,
      'lineThickness': 2,
      'balloonColor': chartColors.grayLight,
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
      'axisColor': '#1C1C1C',
      'gridColor': '#1C1C1C',
      'color': chartColors.grayDarkThree,
      'titleColor': chartColors.grayDarkThree,
      'fontFamily': 'CiscoSansTT Light',
      'gridAlpha': 0,
      'axisAlpha': 0.5,
      'tickLength': 0
    };
    baseVariables['guideaxis'] = {
      'axisColor': chartColors.grayLight,
      'gridColor': chartColors.grayLight,
      'color': chartColors.grayDarkest,
      'titleColor': chartColors.grayDarkest,
      'fontFamily': 'CiscoSansTT Light',
      'gridAlpha': 0,
      'axisAlpha': 1,
      'tickLength': 0
    };
    baseVariables['legend'] = {
      'color': chartColors.grayDarkest,
      'autoMargins': false,
      'align': 'center',
      'position': 'bottom',
      'switchable': true,
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
    return {
      getBaseVariable: getBaseVariable,
      getBaseExportForGraph: getBaseExportForGraph,
      getBaseStackSerialGraph: getBaseStackSerialGraph,
      getGanttGraph: getGanttGraph,
      getBasePieChart: getBasePieChart,
      getDummyPieChart: getDummyPieChart
    };

    function getBaseVariable(key) {
      if (baseVariables[key] !== null && !_.isUndefined(baseVariables[key])) {
        return angular.copy(baseVariables[key]);
      } else {
        return {};
      }
    }

    function getBaseExportForGraph(fields, fileName, columnNames) {
      baseVariables['export'] = {
        'enabled': true,
        'exportFields': fields,
        'columnNames': columnNames,
        'fileName': fileName,
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
            'menu': ['PNG', 'JPG']
          }, {
            'label': $translate.instant('reportsPage.pdf'),
            'title': $translate.instant('reportsPage.pdf'),
            click: function () {
              this.capture({}, function () {
                this.toPDF({}, function (data) {
                  $window.open(data, 'amCharts.pdf');
                });
              });
            }
          }, {
            'class': 'export-list',
            'label': $translate.instant('reportsPage.export'),
            'title': $translate.instant('reportsPage.export'),
            'menu': ['CSV', 'XLSX']
          }]
        }]
      };
      return baseVariables['export'];
    }

    function getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, categoryField, catAxis, exportData) {
      return angular.copy({
        'type': 'serial',
        'pathToImages': amchartsImages,
        'startEffect': 'easeOutSine',
        'addClassNames': true,
        'fontFamily': 'CiscoSansTT Extra Light',
        'backgroundColor': chartColors.brandWhite,
        'backgroundAlpha': 1,
        'balloon': baseVariables['balloon'],
        'autoMarginOffset': 25,
        'autoMargins': false,
        'marginLeft': 40,
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
        'chartCursor': {
          'cursorColor': '#55bb76',
          'categoryBalloonDateFormat': 'JJ:NN, DD MMMM',
          'valueBalloonsEnabled': false,
          'cursorAlpha': 0,
          'valueLineAlpha': 0.5,
          'valueLineBalloonEnabled': true,
          'valueLineEnabled': true,
          'zoomable': true,
          'valueZoomable': false
        },
        'chartScrollbar': {
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
          'color': '#AAAAAA',
          'updateOnReleaseOnly': true
        },
        'valueScrollbar': {
          'offset': 35,
          'color': '#AAAAAA',
          'backgroundColor': '#ffffff',
          'backgroundAlpha': 1,
          'oppositeAxis': false
        }
      });
    }

    function getGanttGraph(data, valueAxis, exportData, catAxis) {
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
        'balloon': {
          'fixedPosition': false
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
        'valueScrollbar': {
          'autoGridCount': true,
          'color': '#AAAAAA',
          'backgroundColor': '#D7DBDD',
          'backgroundAlpha': 1
        },
        /*'chartScrollbar': {
          'offset': 15,
          'color': '#AAAAAA',
          'backgroundColor': '#D7DBDD',
          'backgroundAlpha': 1,
          //'oppositeAxis': false
        },*/
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

    function getBasePieChart(data, chartOptions) {
      return angular.copy({
        'type': 'pie',
        'startDuration': 0,
        'balloonText': chartOptions.balloonText,
        'outlineThickness': 0,
        'hoverAlpha': 0.5,
        'labelRadius': 1,
        'marginBottom': 40,
        'marginLeft': 40,
        'marginRight': 40,
        'marginTop': 40,
        'autoMargins': false,
        'pullOutRadius': '1%',
        'titleField': 'name',
        'valueField': 'value',
        'theme': 'light',
        'allLabels': [],
        'balloon': {},
        'fontSize': 10,
        'legend': {
          'enabled': true,
          'align': 'center',
          'forceWidth': true,
          'switchable': false,
          'valueText': '',
          'markerSize': 8
        },
        'titles': [],
        'dataProvider': data.dataProvider
      });
    }

    function getDummyPieChart() {
      return angular.copy({
        'type': 'pie',
        'startDuration': 0,
        'labelRadius': 1,
        'marginBottom': 40,
        'marginLeft': 40,
        'marginRight': 40,
        'marginTop': 40,
        'autoMargins': false,
        'balloonText': '',
        'labelText': '[[title]]',
        'pullOutRadius': '1%',
        'colorField': 'color',
        'outlineColor': '#ECECEC',
        'titleField': 'name',
        'valueField': 'value',
        'borderColor': '#A4ACAC',
        'fontSize': 10,
        'theme': 'light',
        'balloon': {
          'fontSize': 0
        },
        'legend': {
          'enabled': true,
          'align': 'center',
          'labelWidth': 0,
          'markerBorderThickness': 5,
          'markerLabelGap': 6,
          'markerSize': 5,
          'valueAlign': 'left',
          'valueText': '',
          'switchable': false
        },
        'titles': [],
        'dataProvider': [{
          'name': 'No data',
          'value': '60',
          'color': '#ececec'
        }, {
          'name': 'No data',
          'value': '40',
          'color': '#d9d9d9'
        }]
      });
    }
  }
})();
