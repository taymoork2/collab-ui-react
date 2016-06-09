(function () {
  'use strict';

  angular.module('Mediafusion')
    .service('DummyMetricsReportService', DummyMetricsReportService);

  /* @ngInject */
  function DummyMetricsReportService($translate, chartColors) {

    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var dummyPopulation = null;
    var customers = null;

    return {
      dummyCallVolumeData: dummyCallVolumeData
    };

    function dummyCallVolumeData(filter) {
      var dummyGraph = [];
      var abs = 0;

      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i, 'day').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          abs = 2 - y;
          dummyGraph.push({
            modifiedDate: moment().subtract(y, 'month').format(monthFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }

  }
})();
