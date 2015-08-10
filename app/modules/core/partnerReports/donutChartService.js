(function () {
  'use strict';

  angular.module('Core')
    .service('DonutChartService', DonutChartService);

  /* @ngInject */
  function DonutChartService($translate, Config) {
    // variables for the call metrics section
    var callMetricsColors = [Config.chartColors.grayDarkest, Config.chartColors.brandInfo];
    var callMetricsDummyColors = [Config.chartColors.grayLight, Config.chartColors.grayLighter];
    var callMetricsLabels = [{
      "align": "center",
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
        return;
      }

      var colors = callMetricsColors;
      var textColor = Config.chartColors.grayDarkest;
      var balloonText = callMetricsBalloonText;
      if (data.dummy) {
        colors = callMetricsDummyColors;
        textColor = Config.chartColors.grayLight;
        balloonText = "";
      }

      return AmCharts.makeChart(callMetricsDiv, {
        "type": "pie",
        "balloonText": balloonText,
        "innerRadius": "75%",
        "labelText": callMetricsLabelText,
        "color": textColor,
        "colors": colors,
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
          var colors = callMetricsColors;
          var textColor = Config.chartColors.grayDarkest;
          var balloonText = callMetricsBalloonText;
          if (data.dummy) {
            colors = callMetricsDummyColors;
            textColor = Config.chartColors.grayLight;
            balloonText = "";
          }

          donutChart.dataProvider = data.dataProvider;
          donutChart.allLabels = getLabels(data.labelData);
          donutChart.color = textColor;
          donutChart.colors = colors;
          donutChart.balloonText = balloonText;

          donutChart.validateNow(true, false);
        } else {
          return;
        }
      }
    }
  }
})();
