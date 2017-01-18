(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageGraphService', DeviceUsageGraphService);

  /* @ngInject */
  function DeviceUsageGraphService($translate, chartColors) {

    function makeChart(id, chart) {
      var amChart = AmCharts.makeChart(id, chart);
      _.each(amChart.graphs, function (graph) {
        graph.balloonFunction = renderBalloon;
      });
      return amChart;
    }

    function renderBalloon(graphDataItem) {
      var totalDuration = secondsTohhmmss(parseFloat(graphDataItem.dataContext.totalDuration) * 3600);
      var text = '<div><h5>' + $translate.instant('reportsPage.usageReports.callDuration') + ' : ' + totalDuration + '</h5>';
      text = text + $translate.instant('reportsPage.usageReports.callCount') + ' : ' + graphDataItem.dataContext.callCount + ' <br/> ';
      //text = text + $translate.instant('reportsPage.usageReports.pairedCount') + ' : ' + graphDataItem.dataContext.pairedCount + '<br/>';
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
      return secondsTohhmmss(parseFloat(item.dataContext.totalDuration) * 3600);
    }

    function getLineChart() {
      return {
        'type': 'serial',
        'categoryField': 'time',
        'dataDateFormat': 'YYYY-MM-DD',
        'addClassNames': true,
        'categoryAxis': {
          'minPeriod': 'DD',
          'parseDates': true,
          'autoGridCount': true,
          'title': 'Last 7 Days',
          'centerLabels': true,
          'equalSpacing': true
        },
        'listeners': [],
        'export': {
          'enabled': true
        },
        'chartCursor': {
          'enabled': true,
          'categoryBalloonDateFormat': 'YYYY-MM-DD',
          //'valueLineEnabled': true,
          //'valueLineBalloonEnabled': true,
          'cursorColor': chartColors.primaryDarker,
          'cursorAlpha': 0.5,
          'valueLineAlpha': 0.5
        },
        // 'chartScrollbar': {
        //   'scrollbarHeight': 2,
        //   'offset': -1,
        //   'backgroundAlpha': 0.1,
        //   'backgroundColor': '#888888',
        //   'selectedBackgroundColor': '#67b7dc',
        //   'selectedBackgroundAlpha': 1
        // },
        'trendLines': [

        ],
        'graphs': [
          {
            'type': 'column', //line', //smoothedLine', //column',
            'labelText': '[[value]]',
            'labelPosition': 'top',
            //'bullet': 'round',
            'id': 'video',
            'title': $translate.instant('reportsPage.usageReports.callDuration'),
            'valueField': 'totalDuration',
            'lineThickness': 2,
            'fillAlphas': 0.6,
            'lineAlpha': 0.0,
            //'bulletSize': 10,
            'lineColor': chartColors.primaryDarker,
            'bulletColor': '#ffffff',
            'bulletBorderAlpha': 1,
            'useLineColorForBulletBorder': true,
            'labelFunction': getLabel,
            'labelOffset': -2
          }
          /*
          {
            'bullet': 'diamond',
            'id': 'whiteboarding',
            'title': 'Whiteboarding',
            'valueField': 'whiteboarding',
            'lineThickness': 2,
            'bulletSize': 6,
            'lineColor': chartColors.primaryLight
          }
          */
        ],
        'guides': [

        ],
        'valueAxes': [
          {
            'id': 'ValueAxis-1',
            'title': $translate.instant('reportsPage.usageReports.callHours')
          }
        ],
        'allLabels': [

        ],
        'balloon': {
          'cornerRadius': 4
        },
        'legend': {
          'enabled': false,
          'useGraphSettings': true,
          'valueWidth': 100
        },
        // 'titles': [
        //   {
        //     'id': 'Title-1',
        //     'size': 15,
        //     'text': $translate.instant('reportsPage.usageReports.deviceUsage')
        //   }
        // ]
      };
    }


    return {
      getLineChart: getLineChart,
      makeChart: makeChart,
    };
  }
}());
