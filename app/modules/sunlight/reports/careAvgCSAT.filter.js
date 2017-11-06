(function () {
  'use strict';

  angular.module('Sunlight')
    .filter('careAvgCSAT', careAvgCSAT);

  /* @ngInject */
  function careAvgCSAT(CareReportsService) {
    return filter;

    function filter(avgCsatValue) {
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(avgCsatValue) || avgCsatValue === 0) {
        return '-';
      }

      return CareReportsService.roundCSATAvg(avgCsatValue);
    }
  }
})();
