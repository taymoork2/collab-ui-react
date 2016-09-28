(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageTimelineService', DeviceUsageTimelineService);

  /* @ngInject */
  function DeviceUsageTimelineService($q, $log, chartColors) {

    function randVal() {
      return _.random(0, 50);
    }

    function sample(time) {
      return {
        'video': randVal(),
        'whiteboarding': randVal(),
        'time': time
      };
    }

    function getData(period, count, granularity) {
      var data = [];
      var start = moment().startOf(period).subtract(count, period + 's');
      var end = moment().startOf(period);
      while (start.isBefore(end)) {
        var time = start.format('YYYY-MM-DD');
        data.push(sample(time));
        start.add(1, granularity + 's');
      }
      $log.info('data', data);
      return $q.when(data);
    }

    function getLineChart() {
      return {
        'type': 'serial',
        'categoryField': 'time',
        'dataDateFormat': 'YYYY-MM-DD',
        'categoryAxis': {
          'minPeriod': 'DD',
          'parseDates': true,
          'autoGridCount': true
        },
        'listeners': [],
        'export': {
          'enabled': true
        },
        'chartCursor': {
          'enabled': true,
          'categoryBalloonDateFormat': 'YYYY-MM-DD'
        },
        'chartScrollbar': {
          'scrollbarHeight': 2,
          'offset': -1,
          'backgroundAlpha': 0.1,
          'backgroundColor': '#888888',
          'selectedBackgroundColor': '#67b7dc',
          'selectedBackgroundAlpha': 1
        },
        'trendLines': [

        ],
        'graphs': [
          {
            'bullet': 'round',
            'id': 'video',
            'title': 'Video',
            'valueField': 'video',
            'lineThickness': 2,
            'bulletSize': 8,
            'lineColor': chartColors.primaryColorDarker
          },
          {
            'bullet': 'diamond',
            'id': 'whiteboarding',
            'title': 'Whiteboarding',
            'valueField': 'whiteboarding',
            'lineThickness': 2,
            'bulletSize': 6,
            'lineColor': chartColors.primaryColorLight
          }
        ],
        'guides': [

        ],
        'valueAxes': [
          {
            'id': 'ValueAxis-1',
            'title': 'Activity Minutes'
          }
        ],
        'allLabels': [

        ],
        'balloon': {

        },
        'legend': {
          'enabled': true,
          'useGraphSettings': true
        },
        'titles': [
          {
            'id': 'Title-1',
            'size': 15,
            'text': 'Usage Timeline (mock data)'
          }
        ]
      };
    }

    return {
      getData: getData,
      getLineChart: getLineChart
    };
  }
}());
