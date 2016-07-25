(function () {
  'use strict';

  angular.module('Sunlight')
    .service('CareReportsGraphService', careReportsGraphService);

  /* @ngInject */
  function careReportsGraphService($translate, chartColors) {
    // Base variables for building grids and charts
    var baseVariables = [];
    baseVariables['graph'] = {
      'lineAlpha': 1,
      'balloonColor': '#AEAEAF',
      'lineThickness': 1
    };

    baseVariables['axis'] = {
      'axisColor': '#D7D7D8',
      'gridColor': chartColors.grayLight,
      'color': '#6A6B6C',
      'fontFamily': 'CiscoSansTT Light',
      'fontSize': 12,
      'titleBold': false,
      'titleColor': '#6A6B6C',
      'gridAlpha': 0,
      'axisAlpha': 1

    };
    baseVariables['legend'] = {
      'color': chartColors.grayDarkest,
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

    baseVariables['balloon'] = {
      'adjustBorderColor': true,
      'borderThickness': 1,
      'borderAlpha': 1,
      'fillAlpha': 1,
      'fillColor': chartColors.brandWhite,
      'fixedPosition': true,
      'shadowAlpha': 0
    };

    baseVariables['chartCursor'] = {
      'valueLineAlpha': 0,
      'balloonPointerOrientation': 'vertical',
      'cursorColor': '#AEAEAF',
      //'fullWidth':true,
      //'cursorPosition': 'start',
      'categoryBalloonEnabled': false,
      'valueLineBalloonEnabled': false,
      'cursorAlpha': 1
    };

    baseVariables['export'] = {
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

    function getBaseVariable(key) {
      if (baseVariables[key] !== null && angular.isDefined(baseVariables[key])) {
        return angular.copy(baseVariables[key]);
      } else {
        return {};
      }
    }

    function getBaseSerialGraph(data, valueAxes, graphs, categoryField, catAxis, exportReport, chartCursor) {
      return angular.copy({
        'type': 'serial',
        'theme': 'light',
        'colors': data.colors,
        'marginRight': 30,
        'legend': {
          'data': [{
            title: data.legendTitles[1],
            color: data.colors[1]
          }, {
            title: data.legendTitles[0],
            color: data.colors[0]
          }],
          'equalWidths': false,
          'position': 'bottom'
        },
        'dataProvider': data.data,
        'valueAxes': valueAxes,
        'graphs': graphs,
        'balloon': baseVariables['balloon'],
        'plotAreaBorderAlpha': 0,
        'marginTop': 40,
        'marginLeft': 50,
        'chartCursor': chartCursor,
        'categoryField': categoryField,
        'categoryAxis': catAxis,
        'export': exportReport
      });
    }

    var service = {
      getBaseVariable: getBaseVariable,
      getBaseSerialGraph: getBaseSerialGraph
    };

    return service;
  }
})();
