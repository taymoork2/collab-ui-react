(function () {
  'use strict';

  angular.module('Core')
    .service('DonutChartService', DonutChartService);

  /* @ngInject */
  function DonutChartService($translate, Config) {
    // variables for the call metrics section
    var callMetricsColors = [Config.chartColors.grayDarkest, Config.chartColors.brandInfo];
    var callMetricsDummyColors = [Config.chartColors.dummyGray, Config.chartColors.dummyGrayLight];
    var callMetricsLabels = [{
      "align": "center",
      "size": "42",
      "text": 0,
      "y": 112
    }, {
      "align": "center",
      "size": "16",
      "text": $translate.instant('callMetrics.totalCalls'),
      "y": 162
    }, {
      "align": "center",
      "size": "30",
      "text": 0,
      "y": 197
    }, {
      "align": "center",
      "size": "16",
      "text": $translate.instant('callMetrics.totalCallMinutes'),
      "y": 232
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
      var labelsEnabled = true;
      if (data.dummy) {
        colors = callMetricsDummyColors;
        textColor = Config.chartColors.brandWhite;
        balloonText = "";
        labelsEnabled = false;
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
        "radius": "30%",
        "outlineAlpha": 1,
        "allLabels": createLabels,
        "dataProvider": createDisplayData,
        "labelsEnabled": labelsEnabled,
        "startDuration": 0,
        "export": {
          "enabled": true,
          "libs": {
            "autoLoad": false
          },
          "menu": [{
            "class": "export-main",
            "label": $translate.instant('reportsPage.downloadOptions'),
            "menu": [{
              "label": $translate.instant('reportsPage.saveAs'),
              "title": $translate.instant('reportsPage.saveAs'),
              "class": "export-list",
              "menu": ["PNG", "JPG", "PDF"]
            }, 'PRINT']
          }]
        }
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
          var labelsEnabled = true;
          if (data.dummy) {
            colors = callMetricsDummyColors;
            textColor = Config.chartColors.brandWhite;
            balloonText = "";
            labelsEnabled = false;
          }

          donutChart.dataProvider = data.dataProvider;
          donutChart.allLabels = getLabels(data.labelData);
          donutChart.color = textColor;
          donutChart.colors = colors;
          donutChart.balloonText = balloonText;
          donutChart.labelsEnabled = labelsEnabled;

          donutChart.validateNow(true, false);
        } else {
          return;
        }
      }
    }
  }
})();
