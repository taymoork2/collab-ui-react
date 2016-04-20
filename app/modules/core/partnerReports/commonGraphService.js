(function () {
  'use strict';

  angular.module('Core')
    .service('CommonGraphService', CommonGraphService);

  /* @ngInject */
  function CommonGraphService($translate, chartColors) {
    // Base variables for building grids and charts
    var baseVariables = [];
    baseVariables['column'] = {
      'type': 'column',
      'fillAlphas': 1,
      'lineAlpha': 0,
      'balloonColor': chartColors.grayLight,
      'columnWidth': 0.6
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
      getBaseSerialGraph: getBaseSerialGraph,
      getBasePieChart: getBasePieChart
    };

    function getBaseVariable(key) {
      if (baseVariables[key] !== null && angular.isDefined(baseVariables[key])) {
        return angular.copy(baseVariables[key]);
      } else {
        return {};
      }
    }

    function getBaseSerialGraph(data, startDuration, valueAxes, graphs, categoryField, catAxis) {
      return angular.copy({
        'type': 'serial',
        'startEffect': 'easeOutSine',
        'addClassNames': true,
        'fontFamily': 'CiscoSansTT Extra Light',
        'backgroundColor': chartColors.brandWhite,
        'backgroundAlpha': 1,
        'balloon': baseVariables['balloon'],
        'autoMargins': false,
        'marginLeft': 60,
        'marginTop': 60,
        'marginRight': 60,
        'usePrefixes': true,
        'prefixesOfBigNumbers': baseVariables['prefixesOfBigNumbers'],
        'export': baseVariables['export'],
        'startDuration': startDuration,
        'dataProvider': data,
        'valueAxes': valueAxes,
        'graphs': graphs,
        'categoryField': categoryField,
        'categoryAxis': catAxis
      });
    }

    function getBasePieChart(data, balloonText, innerRadius, radius, labelText, labelsEnabled, titleField, valueField, colorField, labelColorField) {
      return angular.copy({
        'type': 'pie',
        'balloon': baseVariables['balloon'],
        'export': baseVariables['export'],
        'fontFamily': 'Arial',
        'fontSize': 14,
        'percentPrecision': 0,
        'labelRadius': 25,
        'creditsPosition': 'bottom-left',
        'outlineAlpha': 1,
        'startDuration': 0,
        'dataProvider': data,
        'balloonText': balloonText,
        'innerRadius': innerRadius,
        'radius': radius,
        'labelText': labelText,
        'labelsEnabled': labelsEnabled,
        'titleField': titleField,
        'valueField': valueField,
        'colorField': colorField,
        'labelColorField': labelColorField
      });
    }
  }
})();
