(function () {
  'use strict';

  angular.module('Core')
    .service('DonutChartService', DonutChartService);

  /* @ngInject */
  function DonutChartService($translate, Config) {
    // variables for the call metrics section
    var callConditionFailColor = Config.chartColors.grayDarkest;
    var callConditionSuccessfulColor = Config.chartColors.brandInfo;
    var callMetricsColors = [callConditionFailColor, callConditionSuccessfulColor];
    var callMetricsLabels = [{
      "align": "center",
      "color": Config.chartColors.grayDarkest,
      "size": "42",
      "text": 0,
      "y": 150
    }, {
      "align": "center",
      "size": "16",
      "text": $translate.instant('callMetrics.totalCalls'),
      "y": 200
    }, {
      "align": "center",
      "size": "30",
      "color": Config.chartColors.grayDarkest,
      "text": 0,
      "y": 235
    }, {
      "align": "center",
      "size": "16",
      "text": $translate.instant('callMetrics.totalCallMinutes'),
      "y": 270
    }];
    var callMetricsDiv = 'callMetricsDiv';
    var callMetricsBalloonText = '<div class="donut-hover-text">[[callCondition]]<br>[[numCalls]] ' + $translate.instant('callMetrics.calls') + ' ([[percents]]%)</div>';
    var callMetricsLabelText = '[[percents]]%<br>[[callCondition]]';

    return {
      createCallMetricsDonutChart: createCallMetricsDonutChart,
      updateCallMetricsDonutChart: updateCallMetricsDonutChart
    };

    function createCallMetricsDonutChart(data) {
      var createDisplayData;
      var createLabels;

      if (!angular.isArray(data) && data.length !== 0) {
        createDisplayData = data.dataProvider;
        createLabels = getLabels(data.labelData);
      } else {
        createDisplayData = [];
        createLabels = [];
      }

      return AmCharts.makeChart(callMetricsDiv, {
        "type": "pie",
        "balloonText": callMetricsBalloonText,
        "innerRadius": "75%",
        "labelText": callMetricsLabelText,
        "color": Config.chartColors.grayDarkest,
        "colors": callMetricsColors,
        "titleField": "callCondition",
        "valueField": "numCalls",
        "fontFamily": "Arial",
        "fontSize": 14,
        "percentPrecision": 0,
        "labelRadius": 25,
        "creditsPosition": "bottom-left",
        "radius": "28%",
        "outlineAlpha": 1,
        "allLabels": createLabels,
        "dataProvider": createDisplayData
      });
    }

    function getLabels(data) {
      callMetricsLabels[0].text = data.numTotalCalls;
      callMetricsLabels[2].text = data.numTotalMinutes;
      return callMetricsLabels;
    }

    function updateCallMetricsDonutChart(data, donutChart) {
      if (donutChart !== null) {
        if (!angular.isArray(data) && data.length !== 0) {
          donutChart.dataProvider = data.dataProvider;
          donutChart.allLabels = getLabels(data.labelData);
          donutChart.validateNow(true, false);
        } else {
          donutChart.dataProvider = [];
          donutChart.allLabels = [];
          donutChart.validateNow(true, false);
        }
      }
    }
  }
})();
