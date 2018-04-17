(function () {
  'use strict';

  angular.module('Sunlight')
    .service('CareReportsGraphService', careReportsGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function careReportsGraphService($translate) {
    // Base variables for building grids and charts
    var baseVariables = [];
    baseVariables['graph'] = {
      lineAlpha: 1,
      balloonColor: ChartColors.grayLightOne,
      lineThickness: 1,
      marginTop: 10,
      marginLeft: 0,
      plotAreaBorderAlpha: 0,
      legendValueText: ' ',
      showBalloon: false,
      fillAlphas: 0.1,
    };

    baseVariables['axis'] = {
      axisColor: ChartColors.grayLightTwo,
      gridColor: ChartColors.grayLightTwo,
      color: ChartColors.grayDarkOne,
      fontFamily: 'CiscoSansTT Light',
      fontSize: 12,
      titleBold: false,
      titleColor: ChartColors.grayDarkOne,
      gridAlpha: 0,
      axisAlpha: 1,
      stackType: 'regular',
    };

    baseVariables['legend'] = {
      color: ChartColors.grayDarkThree,
      align: 'center',
      autoMargins: false,
      switchable: false,
      fontSize: 13,
      markerLabelGap: 10,
      markerType: 'square',
      markerSize: 10,
      position: 'bottom',
      equalWidths: true,
      horizontalGap: 5,
      valueAlign: 'left',
      valueWidth: 0,
      verticalGap: 20,
    };

    baseVariables['balloon'] = {
      adjustBorderColor: true,
      borderThickness: 1,
      borderAlpha: 1,
      fillAlpha: 1,
      fillColor: ChartColors.brandWhite,
      fixedPosition: true,
      shadowAlpha: 0,
    };

    baseVariables['chartCursor'] = {
      valueLineAlpha: 0,
      balloonPointerOrientation: 'vertical',
      cursorColor: ChartColors.grayLightOne,
      categoryBalloonEnabled: false,
      valueLineBalloonEnabled: false,
      cursorAlpha: 1,
      graphBulletAlpha: 1,
    };

    baseVariables['title'] = [{
      'text': '',
      'bold': false,
      'font-family': 'Verdana',
      'size': 12,
      'color': ChartColors.grayDarkOne,
      'class': 'amcharts-axis-title',
      'enabled': false,
    }];

    baseVariables['export'] = {
      libs: {
        autoLoad: false,
      },
      menu: [{
        class: 'export-main',
        label: $translate.instant('reportsPage.downloadOptions'),
        menu: [{
          label: $translate.instant('reportsPage.saveAs'),
          title: $translate.instant('reportsPage.saveAs'),
          class: 'export-list',
          menu: ['PNG', 'JPG', 'PDF'],
        }, 'PRINT'],
      }],
    };

    function getBaseVariable(key) {
      if (baseVariables[key] !== null && !_.isUndefined(baseVariables[key])) {
        return _.cloneDeep(baseVariables[key]);
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
      export: false,
    };

    function buildChartConfig(data, legend, graphs, chartCursor, categoryField, categoryAxis, valueAxes, exportReport, title) {
      var chartConfig = {
        dataProvider: data,
        legend: legend,
        graphs: graphs,
        chartCursor: chartCursor,
        categoryField: categoryField,
        categoryAxis: categoryAxis,
        valueAxes: valueAxes,
        export: exportReport,
        titles: title,
      };
      return _.cloneDeep(_.defaults(chartConfig, baseChartConfig));
    }

    var service = {
      getBaseVariable: getBaseVariable,
      buildChartConfig: buildChartConfig,
    };

    return service;
  }
})();
