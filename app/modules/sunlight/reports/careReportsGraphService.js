(function () {
  'use strict';

  angular.module('Sunlight')
    .service('CareReportsGraphService', careReportsGraphService);

  /* @ngInject */
  function careReportsGraphService($translate, chartColors) {
    // Base variables for building grids and charts
    var baseVariables = [];
    baseVariables['graph'] = {
      lineAlpha: 1,
      balloonColor: '#AEAEAF',
      lineThickness: 1,
      marginTop: 10,
      marginLeft: 0,
      plotAreaBorderAlpha: 0,
      legendValueText: ' ',
      showBalloon: false,
      fillAlphas: 0.1
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
      'axisAlpha': 1,
      'stackType': 'regular'
    };

    baseVariables['legend'] = {
      'color': chartColors.grayDarkest,
      'align': 'center',
      'autoMargins': false,
      'switchable': false,
      'fontSize': 13,
      'markerLabelGap': 10,
      'markerSize': 10,
      'position': 'bottom',
      'equalWidths': true,
      'horizontalGap': 5,
      'valueAlign': 'left',
      'valueWidth': 0,
      'verticalGap': 20,
      'useGraphSettings': true
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
      'categoryBalloonEnabled': false,
      'valueLineBalloonEnabled': false,
      'cursorAlpha': 1,
      'graphBulletAlpha': 1
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

    var baseChartConfig = {
      type: 'serial',
      theme: 'light',
      path: './images/',
      marginRight: 30,
      marginTop: 40,
      marginLeft: 50,
      plotAreaBorderAlpha: 0,
      balloon: getBaseVariable('balloon'),
      export: false
    };

    function buildChartConfig(data, legend, graphs, chartCursor, categoryField, categoryAxis, valueAxes, exportReport) {
      var chartConfig = {
        dataProvider: data,
        legend: legend,
        graphs: graphs,
        chartCursor: chartCursor,
        categoryField: categoryField,
        categoryAxis: categoryAxis,
        valueAxes: valueAxes,
        export: exportReport
      };
      return angular.copy(_.defaults(chartConfig, baseChartConfig));
    }

    var service = {
      getBaseVariable: getBaseVariable,
      buildChartConfig: buildChartConfig
    };

    return service;
  }
})();
