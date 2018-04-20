(function () {
  'use strict';

  angular.module('Sunlight')
    .filter('careTime', careTime);

  /* @ngInject */
  function careTime(CareReportsService) {
    return filter;

    function filter(millis) {
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(millis) || millis < 1) {
        return '-';
      }

      return CareReportsService.millisToTime(millis);
    }
  }
})();
