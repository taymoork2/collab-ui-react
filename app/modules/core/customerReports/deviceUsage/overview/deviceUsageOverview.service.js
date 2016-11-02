(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageOverviewService', DeviceUsageOverviewService);

  /* @ngInject */
  function DeviceUsageOverviewService($q, chartColors) {

    function getData() {
      return $q.when([
        {
          'mode': 'video',
          'percentile': 8,
          'color': chartColors.primaryColorDarker
        },
        {
          'mode': 'whiteboarding',
          'percentile': 2,
          'color': chartColors.primaryColorLight
        }
      ]);
    }

    var balloonText = '[[title]]<br><span style="font-size:14px"><b>[[value]]</b> ([[percents]]%)</span>';

    function getPieChart() {
      return {
        'type': 'pie',
        'balloonText': balloonText,
        'innerRadius': '50%',
        'pullOutRadius': '0%',
        'startRadius': '0%',
        'pullOutDuration': 0,
        'pullOutEffect': 'elastic',
        'pullOutOnlyOne': true,
        'sequencedAnimation': false,
        'startEffect': 'easeOutSine',
        'titleField': 'mode',
        'valueField': 'percentile',
        'colorField': 'color',
        'allLabels': [

        ],
        'balloon': {
          'disableMouseEvents': false,
          'fadeOutDuration': 2
        },
        'legend': {
          'enabled': true,
          'align': 'center',
          'markerType': 'circle',
          'switchable': false
        },
        'titles': [
          {
            'id': 'Title-1',
            'size': 15,
            'text': 'Usage Timeline (mock data)'
          }
        ],
        'listeners': []
      };
    }

    return {
      getData: getData,
      getPieChart: getPieChart
    };
  }
}());
