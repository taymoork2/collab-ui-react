(function () {
  'use strict';

  angular
    .module('Core')
    .service('DummyChartService', DummyChartService);

  function DummyChartService() {

    var peakHourChart = {
      "type": "serial",
      "categoryField": "date",
      "dataDateFormat": "YYYY-MM-DD HH:NN:SS",
      "categoryAxis": {
        "minPeriod": "ss",
        "parseDates": true,
        "equalSpacing": false
      },
      "chartCursor": {
        "enabled": true,
        "categoryBalloonDateFormat": "JJ:NN:SS"
      },
      "chartScrollbar": {
        "enabled": true
      },
      "trendLines": [

      ],
      "graphs": [
        {
          "bullet": "round",
          "id": "AmGraph-1",
          "title": "Collaboration Units",
          "valueField": "column-1"
        },
        {
          "bullet": "square",
          "id": "AmGraph-2",
          "title": "Phones",
          "valueField": "column-2"
        }
      ],
      "guides": [

      ],
      "valueAxes": [
        {
          "id": "ValueAxis-1",
          "title": "Call Attempts"
        }
      ],
      "allLabels": [

      ],
      "balloon": {

      },
      "legend": {
        "enabled": true,
        "useGraphSettings": true
      },
      "titles": [
        {
          "id": "Title-1",
          "size": 15,
          "text": "Peak hour (static dummy data)"
        }
      ],
      "dataProvider": [
        {
          "column-1": 8,
          "column-2": 5,
          "date": "2014-03-01 08"
        },
        {
          "column-1": 6,
          "column-2": 7,
          "date": "2014-03-01 09:12:01"
        },
        {
          "column-1": 8,
          "column-2": 9,
          "date": "2014-03-01 09:15:55"
        },
        {
          "column-1": 2,
          "column-2": 3,
          "date": "2014-03-01 10"
        },
        {
          "column-1": 1,
          "column-2": 3,
          "date": "2014-03-01 11"
        },
        {
          "column-1": 2,
          "column-2": 1,
          "date": "2014-03-01 12"
        },
        {
          "column-1": 3,
          "column-2": 2,
          "date": "2014-03-01 13"
        },
        {
          "column-1": 6,
          "column-2": 8,
          "date": "2014-03-01 14"
        }
      ]
    };

    var chart = {
      "type": "serial",
      "theme": "light",
      "marginRight": 40,
      "marginLeft": 40,
      "autoMarginOffset": 20,
      "mouseWheelZoomEnabled": true,
      "dataDateFormat": "YYYY-MM-DD",
      "valueAxes": [{
        "id": "v1",
        "axisAlpha": 0,
        "position": "left",
        "ignoreAxisWidth": true,
        "title": "Started count"
      }],
      "balloon": {
        "borderThickness": 1,
        "shadowAlpha": 0
      },
      "graphs": [{
        "id": "g1",
        "balloon": {
          "drop": true,
          "adjustBorderColor": false,
          "color": "#ffffff"
        },
        "bullet": "round",
        "bulletBorderAlpha": 1,
        "bulletColor": "#FFFFFF",
        "bulletSize": 5,
        "hideBulletsCount": 50,
        "lineThickness": 2,
        "title": "red line",
        "useLineColorForBulletBorder": true,
        "valueField": "value",
        "balloonText": "<span style='font-size:18px;'>[[value]]</span>"
      }],
      "chartScrollbar": {
        "graph": "g1",
        "oppositeAxis": false,
        "offset": 30,
        "scrollbarHeight": 80,
        "backgroundAlpha": 0,
        "selectedBackgroundAlpha": 0.1,
        "selectedBackgroundColor": "#888888",
        "graphFillAlpha": 0,
        "graphLineAlpha": 0.5,
        "selectedGraphFillAlpha": 0,
        "selectedGraphLineAlpha": 1,
        "autoGridCount": true,
        "color": "#AAAAAA"
      },
      "chartCursor": {
        "pan": true,
        "valueLineEnabled": true,
        "valueLineBalloonEnabled": true,
        "cursorAlpha": 1,
        "cursorColor": "#258cbb",
        "limitToGraph": "g1",
        "valueLineAlpha": 0.2,
        "valueZoomable": true
      },
      "valueScrollbar": {
        "oppositeAxis": false,
        "offset": 50,
        "scrollbarHeight": 10
      },
      "categoryField": "interval",
      "categoryAxis": {
        "parseDates": false,
        "dashLength": 0,
        "minorGridEnabled": true
      },
      "export": {
        "enabled": true
      },
      "titles": [
        {
          "id": "Title-1",
          "size": 15,
          "text": "Usage Distribution"
        }
      ],
      "dataProvider": [{
        "interval": "00:00-00:59",
        "value": 13
      }, {
        "interval": "01:00-01:59",
        "value": 11
      }, {
        "interval": "00:00-00:59",
        "value": 13
      }, {
        "interval": "01:00-01:59",
        "value": 11 }]
    };

    function getChart() {
      return chart;
    }

    function getPeakHourChart() {
      return peakHourChart;
    }

    return {
      makeChart: getChart,
      makePeakHourChart: getPeakHourChart
    };
  }

}());
