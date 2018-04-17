(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageGraphService', DeviceUsageGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function DeviceUsageGraphService($translate) {
    function makeChart(id, chart) {
      var amChart = AmCharts.makeChart(id, chart);
      _.each(amChart.graphs, function (graph) {
        graph.balloonFunction = renderBalloon;
      });
      return amChart;
    }

    function renderBalloon(graphDataItem) {
      //var totalDuration = secondsTohhmmss(parseFloat(graphDataItem.dataContext.totalDuration) * 3600);
      var totalDuration = secondsTohhmmss(parseFloat(graphDataItem.dataContext.totalDuration));
      var text = '<div><h5>' + $translate.instant('reportsPage.usageReports.callDuration') + ' : ' + totalDuration + '</h5>';
      text = text + $translate.instant('reportsPage.usageReports.callCount') + ' : ' + graphDataItem.dataContext.callCount + ' <br/> ';
      return text;
    }

    function secondsTohhmmss(totalSeconds) {
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
      var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

      // round seconds
      seconds = Math.round(seconds * 100) / 100;

      var result = hours > 0 ? hours + 'h ' : '';
      if (hours > 99) {
        return result;
      }
      result += minutes > 0 ? minutes + 'm ' : '';
      result += hours < 10 ? seconds + 's' : '';
      return result;
    }

    function getLabel(item) {
      //return secondsTohhmmss(parseFloat(item.dataContext.totalDuration) * 3600);
      return secondsTohhmmss(parseFloat(item.dataContext.totalDuration));
    }

    function getLineChart() {
      return {
        type: 'serial',
        categoryField: 'time',
        dataDateFormat: 'YYYY-MM-DD',
        addClassNames: true,
        categoryAxis: {
          minPeriod: 'DD',
          parseDates: true,
          autoGridCount: true,
          //'title': 'Last 7 Days',
          centerLabels: true,
          equalSpacing: true,
        },
        listeners: [],
        export: {
          enabled: true,
        },
        chartCursor: {
          enabled: true,
          categoryBalloonDateFormat: 'YYYY-MM-DD',
          cursorColor: ChartColors.primaryDarker,
          cursorAlpha: 0.5,
          valueLineAlpha: 0.5,
        },
        trendLines: [

        ],
        graphs: [
          {
            type: 'column',
            labelText: '[[value]]',
            labelPosition: 'top',
            id: 'video',
            title: $translate.instant('reportsPage.usageReports.callDuration'),
            valueField: 'totalDurationY',
            lineThickness: 2,
            fillAlphas: 0.6,
            lineAlpha: 0.0,
            lineColor: ChartColors.primaryDarker,
            bulletColor: ChartColors.brandWhite,
            bulletBorderAlpha: 1,
            useLineColorForBulletBorder: true,
            labelFunction: getLabel,
          },
        ],
        guides: [

        ],
        valueAxes: [
          {
            id: 'ValueAxis-1',
            title: $translate.instant('reportsPage.usageReports.callHours'),
          },
        ],
        allLabels: [

        ],
        balloon: {
          cornerRadius: 4,
        },
        legend: {
          enabled: false,
          useGraphSettings: true,
          valueWidth: 100,
        },
      };
    }


    return {
      getLineChart: getLineChart,
      makeChart: makeChart,
    };
  }
}());
